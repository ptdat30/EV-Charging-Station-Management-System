// FILE: IncidentHistoryResponseDto.java
package com.stationservice.dtos;

import com.stationservice.entities.IncidentHistory;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class IncidentHistoryResponseDto {
    private Long historyId;
    private Long incidentId;
    private IncidentHistory.ActionType actionType;
    private Long actionBy;
    private String actionByName;
    private String oldStatus;
    private String newStatus;
    private String oldPriority;
    private String newPriority;
    private Long oldAssignedTo;
    private Long newAssignedTo;
    private String notes;
    private LocalDateTime createdAt;
}

