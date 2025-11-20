// FILE: ResolveIncidentRequestDto.java
package com.stationservice.dtos;

import lombok.Data;

@Data
public class ResolveIncidentRequestDto {
    private String resolutionNotes; // Required: How was it resolved
    private Integer resolutionRating; // Optional: 1-5 rating
}

