// FILE: UpdateMaintenanceScheduleRequestDto.java
package com.stationservice.dtos;

import com.stationservice.entities.MaintenanceSchedule;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateMaintenanceScheduleRequestDto {
    private String title;
    private String description;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private Long assignedTo;
    private MaintenanceSchedule.Status status;
    private String notes;
}

