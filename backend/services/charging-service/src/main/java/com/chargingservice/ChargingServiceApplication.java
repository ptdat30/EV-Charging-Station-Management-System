// FILE: ChargingServiceApplication.java
package com.chargingservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients; // [COMMAND]: Import annotation

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients // [COMMAND]: Annotation này sẽ quét và kích hoạt các Feign client trong dự án.
@org.springframework.scheduling.annotation.EnableScheduling // Enable scheduled tasks
public class ChargingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChargingServiceApplication.class, args);
	}
}