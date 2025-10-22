// FILE: AuthServiceApplication.java
package com.authservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients; // Enable Feign for calling user-service

@SpringBootApplication
@EnableDiscoveryClient // Register with Eureka
@EnableFeignClients // Enable calling other services
public class AuthServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AuthServiceApplication.class, args);
	}
}