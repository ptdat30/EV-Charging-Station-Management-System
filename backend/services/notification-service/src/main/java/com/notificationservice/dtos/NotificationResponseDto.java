// FILE: NotificationResponseDto.java
package com.notificationservice.dtos;

import com.notificationservice.entities.Notification;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationResponseDto {
    private Long notificationId;
    private Long userId;
    private Notification.NotificationType notificationType;
    private String title;
    private String message;
    private Long referenceId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}