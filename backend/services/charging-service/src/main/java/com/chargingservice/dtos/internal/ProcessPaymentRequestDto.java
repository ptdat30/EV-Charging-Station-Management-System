// FILE: ProcessPaymentRequestDto.java (trong charging-service)
package com.chargingservice.dtos.internal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor // Cần constructor không tham số cho Feign
@AllArgsConstructor // Cần constructor có tham số để dễ tạo đối tượng
public class ProcessPaymentRequestDto {
    private Long sessionId;
    private Long userId;
    private BigDecimal energyConsumed;
    private BigDecimal pricePerKwh; // Thêm trường này nếu bạn muốn gửi giá từ charging-service
}