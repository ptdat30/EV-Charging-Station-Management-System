package com.chargingservice.dtos.internal;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProcessDepositRequestDto {
    private Long reservationId;
    private Long userId;
    private BigDecimal amount;
    private String paymentMethod = "wallet";
}

