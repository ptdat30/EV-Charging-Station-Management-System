// FILE: MaintenanceScheduleResponseDto.java
package com.stationservice.dtos;

import com.stationservice.entities.MaintenanceSchedule;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MaintenanceScheduleResponseDto {
    private Long scheduleId;
    private Long stationId;
    private String stationName;
    private Long chargerId;
    private MaintenanceSchedule.MaintenanceType maintenanceType;
    private String title;
    private String description;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime scheduledEndTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private Long assignedTo;
    private String assignedToName;
    private MaintenanceSchedule.Status status;
    private MaintenanceSchedule.RecurrenceType recurrenceType;
    private Integer recurrenceInterval;
    private LocalDateTime nextScheduledTime;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

