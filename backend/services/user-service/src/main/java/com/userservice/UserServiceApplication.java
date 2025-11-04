// ===============================================================
// FILE: UserServiceApplication.java (hoặc tên tương tự)
// PACKAGE: com.driverservice
// MỤC ĐÍCH: Khởi chạy user-service và kích hoạt Eureka Client.
// ===============================================================
package com.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class UserServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(UserServiceApplication.class, args);
	}

}