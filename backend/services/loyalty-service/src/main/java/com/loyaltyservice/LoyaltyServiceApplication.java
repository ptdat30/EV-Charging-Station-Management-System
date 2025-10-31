// src/main/java/com/loyaltyservice/LoyaltyServiceApplication.java
package com.loyaltyservice;

import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient // [FIX]: Bật Eureka Client
@EnableFeignClients // [FIX]: Bật Feign (nếu cần)
@EnableRabbit // [FIX]: Bật RabbitMQ (quan trọng cho @RabbitListener)
public class LoyaltyServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LoyaltyServiceApplication.class, args);
    }
}