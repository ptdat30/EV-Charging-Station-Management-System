// FILE: UpdateIncidentPriorityRequestDto.java
package com.stationservice.dtos;

import com.stationservice.entities.Incident;
import lombok.Data;

@Data
public class UpdateIncidentPriorityRequestDto {
    private Incident.Priority priority;
    private String notes; // Optional reason for priority change
}

