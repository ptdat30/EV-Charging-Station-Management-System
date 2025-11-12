// FILE: IncidentServiceImpl.java
package com.stationservice.services;

import com.stationservice.clients.NotificationServiceClient;
import com.stationservice.dtos.CreateIncidentRequestDto;
import com.stationservice.dtos.CreateNotificationRequestDto;
import com.stationservice.dtos.IncidentResponseDto;
import com.stationservice.dtos.UpdateIncidentRequestDto;
import com.stationservice.entities.Incident;
import com.stationservice.entities.Station;
import com.stationservice.exceptions.ResourceNotFoundException;
import com.stationservice.repositories.IncidentRepository;
import com.stationservice.repositories.StationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {

    private static final Logger log = LoggerFactory.getLogger(IncidentServiceImpl.class);
    private final IncidentRepository incidentRepository;
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
        incident.setIncidentType(requestDto.getIncidentType());
        incident.setSeverity(requestDto.getSeverity());
        incident.setDescription(requestDto.getDescription());
        incident.setReportedBy(requestDto.getReportedBy());
        incident.setStatus(Incident.Status.pending);

        Incident savedIncident = incidentRepository.save(incident);
        log.info("Incident created successfully. Incident ID: {}", savedIncident.getIncidentId());

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

        if (requestDto.getStatus() != null) {
            incident.setStatus(requestDto.getStatus());
            if (requestDto.getStatus() == Incident.Status.resolved) {
                incident.setResolvedAt(LocalDateTime.now());
            }
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
        List<Incident> incidents = incidentRepository.findAllByOrderByCreatedAtDesc();
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

    private IncidentResponseDto convertToDto(Incident incident, Station station) {
        IncidentResponseDto dto = new IncidentResponseDto();
        dto.setIncidentId(incident.getIncidentId());
        dto.setStationId(incident.getStationId());
        dto.setStationName(station != null ? station.getStationName() : null);
        dto.setChargerId(incident.getChargerId());
        dto.setIncidentType(incident.getIncidentType());
        dto.setSeverity(incident.getSeverity());
        dto.setDescription(incident.getDescription());
        dto.setReportedBy(incident.getReportedBy());
        dto.setStatus(incident.getStatus());
        dto.setCreatedAt(incident.getCreatedAt());
        dto.setUpdatedAt(incident.getUpdatedAt());
        dto.setResolvedAt(incident.getResolvedAt());
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

