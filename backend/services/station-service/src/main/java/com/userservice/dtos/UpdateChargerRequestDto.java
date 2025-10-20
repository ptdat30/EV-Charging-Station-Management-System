// FILE: UpdateChargerRequestDto.java
package com.userservice.dtos;

import com.userservice.entities.Charger;
import lombok.Data;

@Data
public class UpdateChargerRequestDto {
    // Chỉ cho phép cập nhật trạng thái của trụ sạc
    private Charger.ChargerStatus status;
}