// FILE: SessionStartedEvent.java (trong charging-service)
package com.chargingservice.events.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionStartedEvent {
    private Long sessionId;
    private Long userId;
    private Long chargerId;
    private LocalDateTime startTime;
}