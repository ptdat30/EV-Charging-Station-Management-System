package com.paymentservice.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProcessRefundRequestDto {
    private Long paymentId; // ID của payment cần refund
    private Long userId;
    private String reason; // Lý do refund (check-in, cancellation, etc.)
}

