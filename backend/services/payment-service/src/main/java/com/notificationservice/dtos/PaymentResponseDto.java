// FILE: PaymentResponseDto.java
package com.notificationservice.dtos;

import com.notificationservice.entities.Payment;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponseDto {
    private Long paymentId;
    private Long sessionId;
    private Long userId;
    private BigDecimal amount;
    private Payment.PaymentMethod paymentMethod;
    private Payment.PaymentStatus paymentStatus;
    private LocalDateTime paymentTime;
    private LocalDateTime createdAt;
}