// FILE: UpdateIncidentRequestDto.java
package com.stationservice.dtos;

import com.stationservice.entities.Incident;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateIncidentRequestDto {
    private Incident.Status status;
    private String description; // optional
    private LocalDateTime estimatedResolutionTime; // optional
}

