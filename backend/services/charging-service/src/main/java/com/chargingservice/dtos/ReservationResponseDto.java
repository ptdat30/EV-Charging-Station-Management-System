package com.chargingservice.dtos;

import com.chargingservice.entities.Reservation;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ReservationResponseDto {
    private Long reservationId;
    private Long userId;
    private Long stationId;
    private Long chargerId;
    private Long sessionId;
    private LocalDateTime reservedStartTime;
    private LocalDateTime reservedEndTime;
    private Integer durationMinutes;
    private Reservation.ReservationStatus status;
    private String qrCode;
    private String confirmationCode;
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    
    // Deposit info
    private BigDecimal depositAmount;
    private Boolean depositRefunded;
    
    // Check-in info
    private LocalDateTime checkInTime;
    private LocalDateTime checkInDeadline;
    private Boolean isCheckedIn;
    
    // No-show info
    private Integer noShowCount;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

