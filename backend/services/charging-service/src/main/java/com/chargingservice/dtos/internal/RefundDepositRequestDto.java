package com.chargingservice.dtos.internal;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RefundDepositRequestDto {
    private Long reservationId; // For logging/reference
    private Long paymentId;      // Payment ID to refund (from depositPaymentId)
    private Long userId;
    private BigDecimal amount;
    private String reason = "Check-in successful";
}

