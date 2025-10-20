// FILE: CreateNotificationRequestDto.java
package com.notificationservice.dtos;

import com.notificationservice.entities.Notification; // Import enum từ Entity
import lombok.Data;

@Data
public class CreateNotificationRequestDto {
    private Long userId;
    private Notification.NotificationType notificationType;
    private String title;
    private String message;
    private Long referenceId; // Optional: ID của session, payment, etc.
}