// FILE: ApiGatewayApplication.java (Thêm WebClient Bean)
package com.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced; // Import
import org.springframework.context.annotation.Bean; // Import
import org.springframework.web.reactive.function.client.WebClient; // Import

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

	// [COMMAND]: Tạo Bean WebClient.Builder có khả năng Load Balancing
	@Bean
	@LoadBalanced // Tự động sử dụng Eureka để phân giải tên service (AUTH-SERVICE)
	public WebClient.Builder loadBalancedWebClientBuilder() {
		return WebClient.builder();
	}
}