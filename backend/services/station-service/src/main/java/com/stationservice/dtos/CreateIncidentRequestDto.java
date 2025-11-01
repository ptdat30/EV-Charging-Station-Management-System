// FILE: CreateIncidentRequestDto.java
package com.stationservice.dtos;

import com.stationservice.entities.Incident;
import lombok.Data;

@Data
public class CreateIncidentRequestDto {
    private Long stationId;
    private Long chargerId; // optional
    private Incident.IncidentType incidentType;
    private Incident.Severity severity;
    private String description;
    private String reportedBy; // optional
}

