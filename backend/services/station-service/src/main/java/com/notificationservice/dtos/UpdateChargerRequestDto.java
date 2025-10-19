// FILE: UpdateChargerRequestDto.java
package com.notificationservice.dtos;

import com.notificationservice.entities.Charger;
import lombok.Data;

@Data
public class UpdateChargerRequestDto {
    // Chỉ cho phép cập nhật trạng thái của trụ sạc
    private Charger.ChargerStatus status;
}