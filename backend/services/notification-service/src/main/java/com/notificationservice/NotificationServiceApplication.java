// FILE: NotificationServiceApplication.java
package com.notificationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@org.springframework.scheduling.annotation.EnableScheduling // Enable scheduled tasks
@EntityScan(basePackages = "com.notificationservice.entities") // Explicitly scan entities
@EnableJpaRepositories(basePackages = "com.notificationservice.repositories") // Explicitly scan repositories
public class NotificationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(NotificationServiceApplication.class, args);
	}
}