// FILE: NotificationServiceClient.java
package com.stationservice.clients;

import com.stationservice.dtos.CreateNotificationRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

/**
 * Feign client to communicate with NOTIFICATION-SERVICE
 */
@FeignClient(name = "NOTIFICATION-SERVICE")
public interface NotificationServiceClient {

    /**
     * Create a notification
     * Matches endpoint POST /api/notifications in notification-service
     */
    @PostMapping("/api/notifications")
    void createNotification(@RequestBody CreateNotificationRequestDto requestDto);
}

