// FILE: SessionResponseDto.java
package com.notificationservice.dtos;

import com.notificationservice.entities.ChargingSession;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SessionResponseDto {
    private Long sessionId;
    private Long userId;
    private Long stationId;
    private Long chargerId;
    private String sessionCode;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal energyConsumed;
    private ChargingSession.SessionStatus sessionStatus;
    private LocalDateTime createdAt;
}