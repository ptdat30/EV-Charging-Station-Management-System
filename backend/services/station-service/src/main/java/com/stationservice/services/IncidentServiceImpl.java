// FILE: IncidentServiceImpl.java
package com.stationservice.services;

import com.stationservice.clients.NotificationServiceClient;
import com.stationservice.dtos.*;
import com.stationservice.entities.Incident;
import com.stationservice.entities.IncidentHistory;
import com.stationservice.entities.Station;
import com.stationservice.exceptions.ResourceNotFoundException;
import com.stationservice.repositories.IncidentHistoryRepository;
import com.stationservice.repositories.IncidentRepository;
import com.stationservice.repositories.StationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {

    private static final Logger log = LoggerFactory.getLogger(IncidentServiceImpl.class);
    private final IncidentRepository incidentRepository;
    private final IncidentHistoryRepository incidentHistoryRepository;
    private final StationRepository stationRepository;
    private final NotificationServiceClient notificationServiceClient;

    @Override
    @Transactional
    public IncidentResponseDto createIncident(CreateIncidentRequestDto requestDto) {
        log.info("Creating incident for station {} - type {} - severity {}", 
                requestDto.getStationId(), requestDto.getIncidentType(), requestDto.getSeverity());

        // Verify station exists
        Station station = stationRepository.findById(requestDto.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + requestDto.getStationId()));

        Incident incident = new Incident();
        incident.setStationId(requestDto.getStationId());
        incident.setChargerId(requestDto.getChargerId());
        incident.setUserId(requestDto.getUserId());
        incident.setIncidentType(requestDto.getIncidentType());
        incident.setSeverity(requestDto.getSeverity());
        incident.setPriority(requestDto.getPriority() != null ? requestDto.getPriority() : Incident.Priority.medium);
        incident.setDescription(requestDto.getDescription());
        incident.setReportedBy(requestDto.getReportedBy());
        incident.setEstimatedResolutionTime(requestDto.getEstimatedResolutionTime());
        incident.setStatus(Incident.Status.pending);

        Incident savedIncident = incidentRepository.save(incident);
        log.info("Incident created successfully. Incident ID: {}", savedIncident.getIncidentId());

        // Create history record
        createHistoryRecord(savedIncident.getIncidentId(), IncidentHistory.ActionType.created, 
                requestDto.getUserId(), null, null, null, null, null, null, null, "Sự cố được tạo mới");

        // Send notification to all admins about new incident
        try {
            String severityLabel = getSeverityLabel(savedIncident.getSeverity());
            String typeLabel = getIncidentTypeLabel(savedIncident.getIncidentType());
            
            CreateNotificationRequestDto notification = new CreateNotificationRequestDto(
                null, // null userId = send to all admins
                CreateNotificationRequestDto.NotificationType.incident_reported,
                "🚨 Sự cố mới tại " + station.getStationName(),
                String.format("Sự cố %s (Mức độ: %s) đã được báo cáo tại trạm %s%s. " +
                              "Người báo cáo: %s. Mô tả: %s",
                    typeLabel,
                    severityLabel,
                    station.getStationName(),
                    savedIncident.getChargerId() != null ? " - Điểm sạc #" + savedIncident.getChargerId() : "",
                    savedIncident.getReportedBy() != null ? savedIncident.getReportedBy() : "Không rõ",
                    savedIncident.getDescription() != null ? savedIncident.getDescription() : "Không có mô tả"),
                savedIncident.getIncidentId()
            );
            
            notificationServiceClient.createNotification(notification);
            log.info("Notification sent to admins about incident {}", savedIncident.getIncidentId());
        } catch (Exception e) {
            log.warn("Failed to send notification to admins about incident {}: {}", 
                savedIncident.getIncidentId(), e.getMessage());
            // Continue even if notification fails
        }

        return convertToDto(savedIncident, station);
    }

    @Override
    @Transactional
    public IncidentResponseDto updateIncident(Long incidentId, UpdateIncidentRequestDto requestDto) {
        log.info("Updating incident {} - status {}", incidentId, requestDto.getStatus());

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + incidentId));

        Incident.Status oldStatus = incident.getStatus();
        
        if (requestDto.getStatus() != null && !requestDto.getStatus().equals(oldStatus)) {
            incident.setStatus(requestDto.getStatus());
            if (requestDto.getStatus() == Incident.Status.resolved || requestDto.getStatus() == Incident.Status.closed) {
                incident.setResolvedAt(LocalDateTime.now());
            }
            
            // Create history record for status change
            createHistoryRecord(incident.getIncidentId(), IncidentHistory.ActionType.status_changed,
                    null, null, oldStatus.name(), requestDto.getStatus().name(), null, null, null, null,
                    "Trạng thái thay đổi từ " + oldStatus + " sang " + requestDto.getStatus());
        }
        
        if (requestDto.getDescription() != null) {
            incident.setDescription(requestDto.getDescription());
        }
        
        if (requestDto.getEstimatedResolutionTime() != null) {
            incident.setEstimatedResolutionTime(requestDto.getEstimatedResolutionTime());
        }

        Incident updatedIncident = incidentRepository.save(incident);

        Station station = stationRepository.findById(updatedIncident.getStationId())
                .orElse(null);

        return convertToDto(updatedIncident, station);
    }

    @Override
    public IncidentResponseDto getIncidentById(Long incidentId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + incidentId));

        Station station = stationRepository.findById(incident.getStationId())
                .orElse(null);

        return convertToDto(incident, station);
    }

    @Override
    public List<IncidentResponseDto> getAllIncidents() {
        List<Incident> incidents = incidentRepository.findAllByOrderByPriorityDescCreatedAtDesc();
        return incidents.stream()
                .map(incident -> {
                    Station station = stationRepository.findById(incident.getStationId()).orElse(null);
                    return convertToDto(incident, station);
                })
                .toList();
    }

    @Override
    public List<IncidentResponseDto> getIncidentsByStationId(Long stationId) {
        List<Incident> incidents = incidentRepository.findByStationIdOrderByCreatedAtDesc(stationId);
        Station station = stationRepository.findById(stationId).orElse(null);
        return incidents.stream()
                .map(incident -> convertToDto(incident, station))
                .toList();
    }

    @Override
    public List<IncidentResponseDto> getIncidentsByStatus(String status) {
        try {
            Incident.Status statusEnum = Incident.Status.valueOf(status.toLowerCase());
            List<Incident> incidents = incidentRepository.findByStatusOrderByCreatedAtDesc(statusEnum);
            return incidents.stream()
                    .map(incident -> {
                        Station station = stationRepository.findById(incident.getStationId()).orElse(null);
                        return convertToDto(incident, station);
                    })
                    .toList();
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status: {}", status);
            return List.of();
        }
    }

    @Override
    @Transactional
    public IncidentResponseDto assignIncident(Long incidentId, AssignIncidentRequestDto requestDto, Long adminId) {
        log.info("Assigning incident {} to staff {}", incidentId, requestDto.getAssignedTo());
        
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + incidentId));
        
        Long oldAssignedTo = incident.getAssignedTo();
        incident.setAssignedTo(requestDto.getAssignedTo());
        incident.setAssignedAt(LocalDateTime.now());
        
        if (incident.getStatus() == Incident.Status.pending) {
            incident.setStatus(Incident.Status.in_progress);
        }
        
        Incident updatedIncident = incidentRepository.save(incident);
        
        // Create history record
        createHistoryRecord(incidentId, IncidentHistory.ActionType.assigned, adminId, null, null, null, null, null,
                oldAssignedTo, requestDto.getAssignedTo(), requestDto.getNotes());
        
        Station station = stationRepository.findById(updatedIncident.getStationId()).orElse(null);
        return convertToDto(updatedIncident, station);
    }

    @Override
    @Transactional
    public IncidentResponseDto updatePriority(Long incidentId, UpdateIncidentPriorityRequestDto requestDto, Long adminId) {
        log.info("Updating priority of incident {} to {}", incidentId, requestDto.getPriority());
        
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + incidentId));
        
        Incident.Priority oldPriority = incident.getPriority();
        incident.setPriority(requestDto.getPriority());
        
        Incident updatedIncident = incidentRepository.save(incident);
        
        // Create history record
        createHistoryRecord(incidentId, IncidentHistory.ActionType.priority_changed, adminId, null, null, null,
                oldPriority.name(), requestDto.getPriority().name(), null, null, requestDto.getNotes());
        
        Station station = stationRepository.findById(updatedIncident.getStationId()).orElse(null);
        return convertToDto(updatedIncident, station);
    }

    @Override
    @Transactional
    public IncidentResponseDto resolveIncident(Long incidentId, ResolveIncidentRequestDto requestDto, Long adminId) {
        log.info("Resolving incident {}", incidentId);
        
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + incidentId));
        
        incident.setStatus(Incident.Status.resolved);
        incident.setResolvedAt(LocalDateTime.now());
        incident.setResolutionNotes(requestDto.getResolutionNotes());
        if (requestDto.getResolutionRating() != null) {
            incident.setResolutionRating(requestDto.getResolutionRating());
        }
        
        Incident updatedIncident = incidentRepository.save(incident);
        
        // Create history record
        createHistoryRecord(incidentId, IncidentHistory.ActionType.resolved, adminId, null,
                incident.getStatus().name(), Incident.Status.resolved.name(), null, null, null, null,
                "Đã xử lý: " + requestDto.getResolutionNotes());
        
        Station station = stationRepository.findById(updatedIncident.getStationId()).orElse(null);
        return convertToDto(updatedIncident, station);
    }

    @Override
    public List<IncidentResponseDto> getIncidentsByPriority(String priority) {
        try {
            Incident.Priority priorityEnum = Incident.Priority.valueOf(priority.toLowerCase());
            List<Incident> incidents = incidentRepository.findByPriorityOrderByCreatedAtDesc(priorityEnum);
            return incidents.stream()
                    .map(incident -> {
                        Station station = stationRepository.findById(incident.getStationId()).orElse(null);
                        return convertToDto(incident, station);
                    })
                    .toList();
        } catch (IllegalArgumentException e) {
            log.warn("Invalid priority: {}", priority);
            return List.of();
        }
    }

    @Override
    public List<IncidentResponseDto> getIncidentsByAssignedTo(Long assignedTo) {
        List<Incident> incidents = incidentRepository.findByAssignedToOrderByCreatedAtDesc(assignedTo);
        return incidents.stream()
                .map(incident -> {
                    Station station = stationRepository.findById(incident.getStationId()).orElse(null);
                    return convertToDto(incident, station);
                })
                .toList();
    }

    @Override
    public List<IncidentResponseDto> getActiveIncidents() {
        List<Incident.Status> activeStatuses = List.of(Incident.Status.pending, Incident.Status.in_progress);
        List<Incident> incidents = incidentRepository.findByStatusInOrderByPriorityDescCreatedAtDesc(activeStatuses);
        return incidents.stream()
                .map(incident -> {
                    Station station = stationRepository.findById(incident.getStationId()).orElse(null);
                    return convertToDto(incident, station);
                })
                .toList();
    }

    @Override
    public List<IncidentResponseDto> getIncidentsByType(String incidentType) {
        try {
            Incident.IncidentType typeEnum = Incident.IncidentType.valueOf(incidentType.toLowerCase());
            List<Incident> incidents = incidentRepository.findByIncidentTypeOrderByCreatedAtDesc(typeEnum);
            return incidents.stream()
                    .map(incident -> {
                        Station station = stationRepository.findById(incident.getStationId()).orElse(null);
                        return convertToDto(incident, station);
                    })
                    .toList();
        } catch (IllegalArgumentException e) {
            log.warn("Invalid incident type: {}", incidentType);
            return List.of();
        }
    }

    @Override
    public List<IncidentResponseDto> getIncidentsBySeverity(String severity) {
        try {
            Incident.Severity severityEnum = Incident.Severity.valueOf(severity.toLowerCase());
            List<Incident> incidents = incidentRepository.findBySeverityOrderByCreatedAtDesc(severityEnum);
            return incidents.stream()
                    .map(incident -> {
                        Station station = stationRepository.findById(incident.getStationId()).orElse(null);
                        return convertToDto(incident, station);
                    })
                    .toList();
        } catch (IllegalArgumentException e) {
            log.warn("Invalid severity: {}", severity);
            return List.of();
        }
    }

    @Override
    public List<IncidentHistoryResponseDto> getIncidentHistory(Long incidentId) {
        List<IncidentHistory> history = incidentHistoryRepository.findByIncidentIdOrderByCreatedAtDesc(incidentId);
        return history.stream()
                .map(this::convertHistoryToDto)
                .toList();
    }

    @Override
    public IncidentStatisticsDto getIncidentStatistics() {
        List<Incident> allIncidents = incidentRepository.findAll();
        
        IncidentStatisticsDto stats = new IncidentStatisticsDto();
        stats.setTotalIncidents((long) allIncidents.size());
        stats.setPendingIncidents(allIncidents.stream().filter(i -> i.getStatus() == Incident.Status.pending).count());
        stats.setInProgressIncidents(allIncidents.stream().filter(i -> i.getStatus() == Incident.Status.in_progress).count());
        stats.setResolvedIncidents(allIncidents.stream().filter(i -> i.getStatus() == Incident.Status.resolved).count());
        stats.setClosedIncidents(allIncidents.stream().filter(i -> i.getStatus() == Incident.Status.closed).count());
        
        // Group by type
        Map<String, Long> byType = allIncidents.stream()
                .collect(Collectors.groupingBy(i -> i.getIncidentType().name(), Collectors.counting()));
        stats.setIncidentsByType(byType);
        
        // Group by severity
        Map<String, Long> bySeverity = allIncidents.stream()
                .collect(Collectors.groupingBy(i -> i.getSeverity().name(), Collectors.counting()));
        stats.setIncidentsBySeverity(bySeverity);
        
        // Group by priority
        Map<String, Long> byPriority = allIncidents.stream()
                .collect(Collectors.groupingBy(i -> i.getPriority().name(), Collectors.counting()));
        stats.setIncidentsByPriority(byPriority);
        
        // Group by status
        Map<String, Long> byStatus = allIncidents.stream()
                .collect(Collectors.groupingBy(i -> i.getStatus().name(), Collectors.counting()));
        stats.setIncidentsByStatus(byStatus);
        
        // Calculate average resolution time
        List<Incident> resolved = allIncidents.stream()
                .filter(i -> i.getResolvedAt() != null && i.getCreatedAt() != null)
                .toList();
        
        if (!resolved.isEmpty()) {
            double avgHours = resolved.stream()
                    .mapToLong(i -> Duration.between(i.getCreatedAt(), i.getResolvedAt()).toHours())
                    .average()
                    .orElse(0.0);
            stats.setAverageResolutionTimeHours(avgHours);
        } else {
            stats.setAverageResolutionTimeHours(0.0);
        }
        
        stats.setUrgentIncidentsCount(allIncidents.stream()
                .filter(i -> i.getPriority() == Incident.Priority.urgent).count());
        stats.setCriticalSeverityCount(allIncidents.stream()
                .filter(i -> i.getSeverity() == Incident.Severity.critical).count());
        
        return stats;
    }

    private void createHistoryRecord(Long incidentId, IncidentHistory.ActionType actionType, Long actionBy,
                                   String actionByName, String oldStatus, String newStatus, String oldPriority,
                                   String newPriority, Long oldAssignedTo, Long newAssignedTo, String notes) {
        IncidentHistory history = new IncidentHistory();
        history.setIncidentId(incidentId);
        history.setActionType(actionType);
        history.setActionBy(actionBy);
        history.setActionByName(actionByName);
        history.setOldStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setOldPriority(oldPriority);
        history.setNewPriority(newPriority);
        history.setOldAssignedTo(oldAssignedTo);
        history.setNewAssignedTo(newAssignedTo);
        history.setNotes(notes);
        incidentHistoryRepository.save(history);
    }


    private IncidentResponseDto convertToDto(Incident incident, Station station) {
        IncidentResponseDto dto = new IncidentResponseDto();
        dto.setIncidentId(incident.getIncidentId());
        dto.setStationId(incident.getStationId());
        dto.setStationName(station != null ? station.getStationName() : null);
        dto.setChargerId(incident.getChargerId());
        dto.setUserId(incident.getUserId());
        dto.setIncidentType(incident.getIncidentType());
        dto.setSeverity(incident.getSeverity());
        dto.setPriority(incident.getPriority());
        dto.setDescription(incident.getDescription());
        dto.setReportedBy(incident.getReportedBy());
        dto.setAssignedTo(incident.getAssignedTo());
        dto.setAssignedAt(incident.getAssignedAt());
        dto.setStatus(incident.getStatus());
        dto.setResolutionNotes(incident.getResolutionNotes());
        dto.setResolutionRating(incident.getResolutionRating());
        dto.setEstimatedResolutionTime(incident.getEstimatedResolutionTime());
        dto.setCreatedAt(incident.getCreatedAt());
        dto.setUpdatedAt(incident.getUpdatedAt());
        dto.setResolvedAt(incident.getResolvedAt());
        
        // Try to get assigned user name (optional)
        if (incident.getAssignedTo() != null) {
            try {
                // This would require UserServiceClient - can be added later
                dto.setAssignedToName("Staff #" + incident.getAssignedTo());
            } catch (Exception e) {
                // Ignore if user service unavailable
            }
        }
        
        return dto;
    }

    private IncidentHistoryResponseDto convertHistoryToDto(IncidentHistory history) {
        IncidentHistoryResponseDto dto = new IncidentHistoryResponseDto();
        dto.setHistoryId(history.getHistoryId());
        dto.setIncidentId(history.getIncidentId());
        dto.setActionType(history.getActionType());
        dto.setActionBy(history.getActionBy());
        dto.setActionByName(history.getActionByName());
        dto.setOldStatus(history.getOldStatus());
        dto.setNewStatus(history.getNewStatus());
        dto.setOldPriority(history.getOldPriority());
        dto.setNewPriority(history.getNewPriority());
        dto.setOldAssignedTo(history.getOldAssignedTo());
        dto.setNewAssignedTo(history.getNewAssignedTo());
        dto.setNotes(history.getNotes());
        dto.setCreatedAt(history.getCreatedAt());
        return dto;
    }

    private String getSeverityLabel(Incident.Severity severity) {
        return switch (severity) {
            case low -> "Thấp";
            case medium -> "Trung bình";
            case high -> "Cao";
            case critical -> "Nghiêm trọng";
        };
    }

    private String getIncidentTypeLabel(Incident.IncidentType type) {
        return switch (type) {
            case equipment -> "Thiết bị";
            case power -> "Điện năng";
            case network -> "Mạng";
            case other -> "Khác";
        };
    }
}

