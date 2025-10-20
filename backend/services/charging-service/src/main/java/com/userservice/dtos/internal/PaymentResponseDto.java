// FILE: PaymentResponseDto.java (trong charging-service)
package com.userservice.dtos.internal;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentResponseDto {
    private Long paymentId;
    private Long sessionId;
    private Long userId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod; // Cần định nghĩa enum này
    private PaymentStatus paymentStatus; // Cần định nghĩa enum này
    private LocalDateTime paymentTime;
    private LocalDateTime createdAt;

    // Định nghĩa enum khớp với payment-service
    public enum PaymentMethod {
        wallet, e_wallet, banking, credit_card, debit_card, cash, qr_payment
    }

    public enum PaymentStatus {
        pending, processing, completed, failed, refunded, cancelled
    }
}