// FILE: UpdateChargerRequestDto.java
package com.stationservice.dtos;

import com.stationservice.entities.Charger;
import lombok.Data;

@Data
public class UpdateChargerRequestDto {
    // Chỉ cho phép cập nhật trạng thái của trụ sạc
    private Charger.ChargerStatus status;
}