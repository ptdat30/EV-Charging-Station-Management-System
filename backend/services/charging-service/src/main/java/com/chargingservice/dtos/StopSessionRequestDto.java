// FILE: StopSessionRequestDto.java
package com.chargingservice.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class StopSessionRequestDto {
    // Năng lượng đã sạc thực tế (kWh) - lấy từ frontend
    private BigDecimal energyCharged;
    
    // State of Charge hiện tại (%) - lấy từ frontend
    private Double currentSOC;
}

