// FILE: AssignIncidentRequestDto.java
package com.stationservice.dtos;

import lombok.Data;

@Data
public class AssignIncidentRequestDto {
    private Long assignedTo; // Staff/Admin ID
    private String notes; // Optional notes
}

