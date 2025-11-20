// FILE: IncidentService.java
package com.stationservice.services;

import com.stationservice.dtos.*;
import java.util.List;

public interface IncidentService {
    // Basic CRUD
    IncidentResponseDto createIncident(CreateIncidentRequestDto requestDto);
    IncidentResponseDto updateIncident(Long incidentId, UpdateIncidentRequestDto requestDto);
    IncidentResponseDto getIncidentById(Long incidentId);
    List<IncidentResponseDto> getAllIncidents();
    List<IncidentResponseDto> getIncidentsByStationId(Long stationId);
    List<IncidentResponseDto> getIncidentsByStatus(String status);
    
    // Admin Management Functions
    IncidentResponseDto assignIncident(Long incidentId, AssignIncidentRequestDto requestDto, Long adminId);
    IncidentResponseDto updatePriority(Long incidentId, UpdateIncidentPriorityRequestDto requestDto, Long adminId);
    IncidentResponseDto resolveIncident(Long incidentId, ResolveIncidentRequestDto requestDto, Long adminId);
    List<IncidentResponseDto> getIncidentsByPriority(String priority);
    List<IncidentResponseDto> getIncidentsByAssignedTo(Long assignedTo);
    List<IncidentResponseDto> getActiveIncidents(); // pending + in_progress
    List<IncidentResponseDto> getIncidentsByType(String incidentType);
    List<IncidentResponseDto> getIncidentsBySeverity(String severity);
    
    // History
    List<IncidentHistoryResponseDto> getIncidentHistory(Long incidentId);
    
    // Statistics for Admin Dashboard
    IncidentStatisticsDto getIncidentStatistics();
}

