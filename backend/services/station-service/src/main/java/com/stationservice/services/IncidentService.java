// FILE: IncidentService.java
package com.stationservice.services;

import com.stationservice.dtos.CreateIncidentRequestDto;
import com.stationservice.dtos.IncidentResponseDto;
import com.stationservice.dtos.UpdateIncidentRequestDto;

import java.util.List;

public interface IncidentService {
    IncidentResponseDto createIncident(CreateIncidentRequestDto requestDto);
    IncidentResponseDto updateIncident(Long incidentId, UpdateIncidentRequestDto requestDto);
    IncidentResponseDto getIncidentById(Long incidentId);
    List<IncidentResponseDto> getAllIncidents();
    List<IncidentResponseDto> getIncidentsByStationId(Long stationId);
    List<IncidentResponseDto> getIncidentsByStatus(String status);
}

