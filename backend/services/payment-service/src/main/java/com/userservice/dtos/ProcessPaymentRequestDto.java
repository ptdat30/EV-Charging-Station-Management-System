// FILE: ProcessPaymentRequestDto.java
package com.userservice.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProcessPaymentRequestDto {
    private Long sessionId;
    private Long userId;
    private BigDecimal energyConsumed; // Năng lượng tiêu thụ (kWh)
    // Giả sử đơn giá là cố định, ví dụ 3000 VND/kWh
    private BigDecimal pricePerKwh = new BigDecimal("3000.00");
}