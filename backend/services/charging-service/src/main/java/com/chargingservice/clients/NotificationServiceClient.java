// FILE: NotificationServiceClient.java (trong charging-service)
package com.chargingservice.clients;

import com.chargingservice.dtos.internal.CreateNotificationRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// [COMMAND]: Định nghĩa client để gọi đến NOTIFICATION-SERVICE
@FeignClient(name = "NOTIFICATION-SERVICE")
public interface NotificationServiceClient {

    // [COMMAND]: Khớp với endpoint POST /api/notifications bên notification-service
    @PostMapping("/api/notifications")
    void createNotification(@RequestBody CreateNotificationRequestDto requestDto);
}