// FILE: CreateNotificationRequestDto.java (trong charging-service)
package com.chargingservice.dtos.internal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationRequestDto {
    private Long userId;
    private NotificationType notificationType;
    private String title;
    private String message;
    private Long referenceId; // e.g., sessionId

    // Enum phải khớp với NotificationType bên notification-service
    public enum NotificationType {
        charging_started, charging_complete, charging_failed,
        payment_success, payment_failed // Thêm các loại khác nếu cần
        // ... thêm các loại khác từ notification-service/entities/Notification.java
    }
}