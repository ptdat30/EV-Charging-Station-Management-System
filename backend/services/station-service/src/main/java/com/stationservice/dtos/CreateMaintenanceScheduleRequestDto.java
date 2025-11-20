// FILE: CreateMaintenanceScheduleRequestDto.java
package com.stationservice.dtos;

import com.stationservice.entities.MaintenanceSchedule;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateMaintenanceScheduleRequestDto {
    private Long stationId;
    private Long chargerId; // Optional
    private MaintenanceSchedule.MaintenanceType maintenanceType;
    private String title;
    private String description;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private Long assignedTo; // Optional
    private MaintenanceSchedule.RecurrenceType recurrenceType; // Optional
    private Integer recurrenceInterval; // Optional
    private String notes; // Optional
}

