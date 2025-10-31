package com.paymentservice.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProcessDepositRequestDto {
    private Long reservationId; // ID của reservation
    private Long userId;
    private BigDecimal amount; // Số tiền deposit
    private String paymentMethod = "wallet"; // Mặc định là wallet
}

