// FILE: CreateChargerRequestDto.java
package com.chargingservice.dtos;

import com.chargingservice.entities.Charger;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateChargerRequestDto {
    // Không cần stationId ở đây vì nó sẽ được lấy từ URL
    private String chargerCode;
    private Charger.ChargerType chargerType;
    private BigDecimal powerRating;
}