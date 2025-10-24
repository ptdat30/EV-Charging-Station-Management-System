package com.apigateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient; // Dùng WebClient để gọi auth-service (non-blocking)
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final WebClient.Builder webClientBuilder;

    // Inject WebClient Builder (cần cấu hình WebClient Bean sau)
    public AuthenticationFilter(WebClient.Builder webClientBuilder) {
        super(Config.class);
        this.webClientBuilder = webClientBuilder;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // 1. Lấy header Authorization
            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, HttpStatus.UNAUTHORIZED); // Thiếu header
            }

            String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);

            // 2. Kiểm tra định dạng "Bearer token"
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, HttpStatus.UNAUTHORIZED); // Sai định dạng
            }

            String token = authHeader.substring(7); // Lấy phần token

            // 3. Gọi auth-service để xác thực token
            return webClientBuilder.build()
                    .get() // Sử dụng GET vì endpoint /validate là GET
                    .uri("http://AUTH-SERVICE/api/auth/validate?token=" + token) // Gọi qua Eureka
                    .retrieve() // Bắt đầu lấy response
                    .toBodilessEntity() // Chỉ cần biết status code, không cần body
                    .flatMap(responseEntity -> {
                        // Nếu auth-service trả về 2xx OK -> token hợp lệ
                        if (responseEntity.getStatusCode().is2xxSuccessful()) {
                            // Cho request đi tiếp vào service đích
                            return chain.filter(exchange);
                        } else {
                            // Nếu auth-service trả về lỗi (401) -> token không hợp lệ
                            return onError(exchange, HttpStatus.UNAUTHORIZED);
                        }
                    })
                    .onErrorResume(error -> {
                        // Xử lý lỗi nếu không gọi được auth-service
                        System.err.println("Error calling auth service: " + error.getMessage());
                        return onError(exchange, HttpStatus.INTERNAL_SERVER_ERROR); // Hoặc UNAUTHORIZED
                    });
        };
    }

    // Phương thức helper trả về lỗi
    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    // Class config rỗng cho filter factory
    public static class Config {}
}