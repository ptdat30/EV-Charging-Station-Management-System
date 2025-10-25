// FILE: AuthenticationFilter.java (trong api-gateway)
package com.apigateway.filter;

import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException; // Import
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationFilter.class); // Thêm Logger
    private final WebClient.Builder webClientBuilder;

    // Danh sách các endpoint công khai
    public static final List<String> publicApiEndpoints = List.of(
            "/api/auth/login",
            "/api/users/register"
            // Thêm các endpoint công khai khác nếu cần, ví dụ GET stations
            // "/api/stations"
    );

    public AuthenticationFilter(WebClient.Builder webClientBuilder) {
        super(Config.class);
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String requestPath = request.getPath().toString();
            log.debug("Processing request for path: {}", requestPath);

            // Kiểm tra endpoint công khai
            Predicate<String> isPublicApi = path -> publicApiEndpoints.stream().anyMatch(requestPath::startsWith);
            if (isPublicApi.test(requestPath)) {
                log.debug("Public endpoint detected, skipping auth filter for: {}", requestPath);
                return chain.filter(exchange);
            }

            // Kiểm tra header Authorization
            log.debug("Protected endpoint detected, checking Authorization header for: {}", requestPath);
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.warn("Missing Authorization header for path: {}", requestPath);
                return onError(exchange, "Missing Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("Invalid Authorization header format for path: {}", requestPath);
                return onError(exchange, "Invalid Authorization header format", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            log.debug("Validating token for path: {}", requestPath);

            // Gọi auth-service để xác thực token và lấy thông tin user
            return webClientBuilder.build()
                    .get()
                    .uri("http://AUTH-SERVICE/api/auth/validate?token=" + token) // Gọi qua Eureka
                    .retrieve() // Bắt đầu lấy response
                    // Xử lý lỗi 4xx từ auth-service (ví dụ: token không hợp lệ)
                    .onStatus(status -> status.is4xxClientError(), clientResponse -> {
                        log.warn("Token validation failed from auth-service (status {}): {}", clientResponse.statusCode(), requestPath);
                        return Mono.error(new InvalidTokenException("Invalid Token")); // Ném exception tùy chỉnh
                    })
                    .bodyToMono(Map.class) // Lấy body response dưới dạng Map
                    .flatMap(responseMap -> {
                        // ResponseMap ví dụ: {isValid=true, username=..., role=DRIVER, userId=1}
                        Boolean isValid = (Boolean) responseMap.getOrDefault("isValid", false);
                        String role = (String) responseMap.get("role");
                        // Cẩn thận khi parse Long từ Map
                        Long userId = -1L; // Giá trị mặc định nếu lỗi
                        Object userIdObj = responseMap.get("userId");
                        if(userIdObj instanceof Number) {
                            userId = ((Number) userIdObj).longValue();
                        } else if (userIdObj != null) {
                            try { userId = Long.parseLong(userIdObj.toString()); } catch (NumberFormatException e) { log.error("Could not parse userId from token validation response: {}", userIdObj); }
                        }


                        if (Boolean.TRUE.equals(isValid) && role != null && !role.equals("UNKNOWN") && userId != -1L) {
                            log.debug("Token valid. Role: {}, UserID: {} for path: {}", role, userId, requestPath);
                            // Thêm role và userId vào header của request gốc
                            ServerHttpRequest mutatedRequest = request.mutate()
                                    .header("X-User-Role", role)
                                    .header("X-User-Id", String.valueOf(userId))
                                    .build();
                            ServerWebExchange mutatedExchange = exchange.mutate().request(mutatedRequest).build();
                            // Cho request đi tiếp
                            return chain.filter(mutatedExchange);
                        } else {
                            log.warn("Token validation failed or missing role/userId for path: {}", requestPath);
                            return onError(exchange, "Invalid Token or missing user info", HttpStatus.UNAUTHORIZED);
                        }
                    })
                    .onErrorResume(error -> {
                        // Xử lý lỗi nếu gọi auth-service thất bại hoặc InvalidTokenException
                        if (error instanceof InvalidTokenException) {
                            return onError(exchange, error.getMessage(), HttpStatus.UNAUTHORIZED);
                        }
                        log.error("Error calling auth service for token validation: {}", error.getMessage());
                        return onError(exchange, "Authentication Service Error", HttpStatus.INTERNAL_SERVER_ERROR);
                    });
        };
    }

    // Phương thức helper trả về lỗi
    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        log.warn("Authentication error: {} - Path: {} - Status: {}", err, exchange.getRequest().getPath(), httpStatus);
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    // Class config rỗng
    public static class Config {}

    // Exception tùy chỉnh để xử lý lỗi 4xx từ auth-service
    private static class InvalidTokenException extends RuntimeException {
        public InvalidTokenException(String message) {
            super(message);
        }
    }
}