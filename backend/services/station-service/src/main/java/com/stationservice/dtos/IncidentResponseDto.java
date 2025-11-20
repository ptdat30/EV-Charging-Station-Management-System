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
    private Long userId;
    private Incident.IncidentType incidentType;
    private Incident.Severity severity;
    private Incident.Priority priority;
    private String description;
    private String reportedBy;
    private Long assignedTo;
    private String assignedToName;
    private LocalDateTime assignedAt;
    private Incident.Status status;
    private String resolutionNotes;
    private Integer resolutionRating;
    private LocalDateTime estimatedResolutionTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}

