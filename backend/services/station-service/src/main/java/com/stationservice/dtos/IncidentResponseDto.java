// FILE: IncidentResponseDto.java
package com.stationservice.dtos;

import com.stationservice.entities.Incident;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class IncidentResponseDto {
    private Long incidentId;
    private Long stationId;
    private String stationName;
    private Long chargerId;
    private Incident.IncidentType incidentType;
    private Incident.Severity severity;
    private String description;
    private String reportedBy;
    private Incident.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}

