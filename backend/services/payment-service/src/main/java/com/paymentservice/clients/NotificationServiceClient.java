// FILE: NotificationServiceClient.java (in payment-service)
package com.paymentservice.clients;

import com.paymentservice.dtos.internal.CreateNotificationRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// Define the client to call NOTIFICATION-SERVICE
@FeignClient(name = "NOTIFICATION-SERVICE")
public interface NotificationServiceClient {

    // Match the POST /api/notifications endpoint in notification-service
    @PostMapping("/api/notifications")
    void createNotification(@RequestBody CreateNotificationRequestDto requestDto);
}