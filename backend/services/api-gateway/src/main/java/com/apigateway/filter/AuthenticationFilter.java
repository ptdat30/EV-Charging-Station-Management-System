package com.apigateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List; // Import List
import java.util.function.Predicate; // Import Predicate

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final WebClient.Builder webClientBuilder;

    // Danh sách các endpoint công khai, không cần kiểm tra token
    public static final List<String> publicApiEndpoints = List.of(
            "/api/auth/login",
            "/api/users/register"
            // Thêm các endpoint công khai khác nếu có
    );

    public AuthenticationFilter(WebClient.Builder webClientBuilder) {
        super(Config.class);
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String requestPath = exchange.getRequest().getPath().toString();
            System.out.println("Processing request for path: " + requestPath); // Log để debug

            // [COMMAND]: KIỂM TRA XEM REQUEST CÓ ĐẾN ENDPOINT CÔNG KHAI KHÔNG
            Predicate<String> isPublicApi = path -> publicApiEndpoints.stream()
                    .anyMatch(requestPath::startsWith);

            if (isPublicApi.test(requestPath)) {
                System.out.println("Public endpoint detected, skipping auth filter for: " + requestPath);
                // Nếu là endpoint công khai, cho request đi tiếp mà không cần kiểm tra token
                return chain.filter(exchange);
            }

            // --- Logic kiểm tra token (chỉ chạy nếu không phải public endpoint) ---
            System.out.println("Protected endpoint detected, checking Authorization header for: " + requestPath);
            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                System.out.println("Missing Authorization header for path: " + requestPath); // Log lỗi
                return onError(exchange, "Missing Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION); // Dùng getFirst an toàn hơn

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("Invalid Authorization header format for path: " + requestPath); // Log lỗi
                return onError(exchange, "Invalid Authorization header format", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            System.out.println("Validating token for path: " + requestPath); // Log trước khi gọi

            // Gọi auth-service để xác thực token
            return webClientBuilder.build()
                    .get()
                    .uri("http://AUTH-SERVICE/api/auth/validate?token=" + token)
                    .retrieve()
                    .toBodilessEntity()
                    .flatMap(responseEntity -> {
                        if (responseEntity.getStatusCode().is2xxSuccessful()) {
                            System.out.println("Token validation successful for path: " + requestPath);
                            // Token hợp lệ, cho request đi tiếp
                            return chain.filter(exchange);
                        } else {
                            System.out.println("Token validation failed from auth-service for path: " + requestPath); // Log lỗi
                            // Token không hợp lệ
                            return onError(exchange, "Invalid Token", HttpStatus.UNAUTHORIZED);
                        }
                    })
                    .onErrorResume(error -> {
                        // Lỗi khi gọi auth-service
                        System.err.println("Error calling auth service for token validation: " + error.getMessage());
                        return onError(exchange, "Authentication Service Error", HttpStatus.INTERNAL_SERVER_ERROR);
                    });
        };
    }

    // Phương thức helper trả về lỗi với message (tùy chọn)
    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        System.out.println("Authentication error: " + err + " - Path: " + exchange.getRequest().getPath() + " - Status: " + httpStatus); // Log chi tiết lỗi
        exchange.getResponse().setStatusCode(httpStatus);
        // Có thể thêm message vào response body nếu muốn
        // byte[] bytes = err.getBytes(StandardCharsets.UTF_8);
        // DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
        // return exchange.getResponse().writeWith(Mono.just(buffer));
        return exchange.getResponse().setComplete();
    }

    // Class config rỗng
    public static class Config {}
}