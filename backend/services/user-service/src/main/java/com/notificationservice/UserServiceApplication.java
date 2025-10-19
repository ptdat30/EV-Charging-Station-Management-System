// ===============================================================
// FILE: UserServiceApplication.java (hoặc tên tương tự)
// PACKAGE: com.driverservice
// MỤC ĐÍCH: Khởi chạy user-service và kích hoạt Eureka Client.
// ===============================================================
package com.notificationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
// [COMMAND]: @EnableDiscoveryClient kích hoạt cơ chế client,
// giúp service này tự động đăng ký với Eureka Server khi khởi động.
@EnableDiscoveryClient
public class UserServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(UserServiceApplication.class, args);
	}

}