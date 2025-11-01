// FILE: UpdateIncidentRequestDto.java
package com.stationservice.dtos;

import com.stationservice.entities.Incident;
import lombok.Data;

@Data
public class UpdateIncidentRequestDto {
    private Incident.Status status;
}

