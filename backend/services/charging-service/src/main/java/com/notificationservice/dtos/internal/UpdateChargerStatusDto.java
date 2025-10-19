// FILE: UpdateChargerStatusDto.java
package com.notificationservice.dtos.internal;

import lombok.Data;

@Data
public class UpdateChargerStatusDto {
    private ChargerStatus status;

    // [COMMAND]: Enum này phải khớp chính xác với enum ChargerStatus bên trong station-service.
    public enum ChargerStatus {
        available, in_use, offline, maintenance, reserved
    }
}