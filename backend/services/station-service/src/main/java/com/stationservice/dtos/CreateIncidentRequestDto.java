// FILE: CreateIncidentRequestDto.java
package com.stationservice.dtos;

import com.stationservice.entities.Incident;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateIncidentRequestDto {
    private Long stationId;
    private Long chargerId; // optional
    private Long userId; // optional - ID của user báo cáo
    private Incident.IncidentType incidentType;
    private Incident.Severity severity;
    private Incident.Priority priority; // optional, default: medium
    private String description;
    private String reportedBy; // optional
    private LocalDateTime estimatedResolutionTime; // optional
}

