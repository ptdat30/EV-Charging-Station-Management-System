// FILE: ChargerResponseDto.java
package com.notificationservice.dtos;

import com.notificationservice.entities.Charger;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ChargerResponseDto {
    private Long chargerId;
    private Long stationId; // Thêm stationId để dễ tham chiếu
    private String chargerCode;
    private Charger.ChargerType chargerType;
    private BigDecimal powerRating;
    private Charger.ChargerStatus status;
    private LocalDateTime createdAt;
}