// FILE: UpdateChargerRequestDto.java
package com.chargingservice.dtos;

import com.chargingservice.entities.Charger;
import lombok.Data;

@Data
public class UpdateChargerRequestDto {
    // Chỉ cho phép cập nhật trạng thái của trụ sạc
    private Charger.ChargerStatus status;
}