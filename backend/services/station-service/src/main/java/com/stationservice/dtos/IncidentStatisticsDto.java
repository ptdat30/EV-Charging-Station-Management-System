// FILE: IncidentStatisticsDto.java
package com.stationservice.dtos;

import lombok.Data;
import java.util.Map;

@Data
public class IncidentStatisticsDto {
    private Long totalIncidents;
    private Long pendingIncidents;
    private Long inProgressIncidents;
    private Long resolvedIncidents;
    private Long closedIncidents;
    
    private Map<String, Long> incidentsByType; // equipment, power, network, other
    private Map<String, Long> incidentsBySeverity; // low, medium, high, critical
    private Map<String, Long> incidentsByPriority; // low, medium, high, urgent
    private Map<String, Long> incidentsByStatus; // pending, in_progress, resolved, closed
    
    private Double averageResolutionTimeHours; // Average time to resolve
    private Long urgentIncidentsCount; // Priority = urgent
    private Long criticalSeverityCount; // Severity = critical
}

