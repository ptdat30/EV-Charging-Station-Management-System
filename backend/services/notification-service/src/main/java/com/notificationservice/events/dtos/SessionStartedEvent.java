// FILE: SessionStartedEvent.java (trong notification-service)
package com.notificationservice.events.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

// Nội dung giống hệt DTO bên charging-service
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionStartedEvent {
    private Long sessionId;
    private Long userId;
    private Long chargerId;
    private LocalDateTime startTime;
}