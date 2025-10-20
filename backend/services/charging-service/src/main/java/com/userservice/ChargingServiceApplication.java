// FILE: ChargingServiceApplication.java
package com.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients; // [COMMAND]: Import annotation

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients // [COMMAND]: Annotation này sẽ quét và kích hoạt các Feign client trong dự án.
public class ChargingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChargingServiceApplication.class, args);
	}
}