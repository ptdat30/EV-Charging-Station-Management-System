package com.chargingservice.dtos.internal;

import lombok.Data;

@Data
public class ProcessRefundRequestDto {
    private Long paymentId;
    private Long userId;
    private String reason;
}

