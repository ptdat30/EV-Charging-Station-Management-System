// FILE: IncidentController.java
package com.stationservice.controllers;

import com.stationservice.dtos.*;
import com.stationservice.services.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    // Public endpoints
    @PostMapping
    public ResponseEntity<IncidentResponseDto> createIncident(@RequestBody CreateIncidentRequestDto requestDto) {
        IncidentResponseDto response = incidentService.createIncident(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponseDto> getIncidentById(@PathVariable Long id) {
        IncidentResponseDto response = incidentService.getIncidentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<IncidentResponseDto>> getAllIncidents(
            @RequestParam(required = false) Long stationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String severity) {
        if (stationId != null) {
            return ResponseEntity.ok(incidentService.getIncidentsByStationId(stationId));
        }
        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(incidentService.getIncidentsByStatus(status));
        }
        if (priority != null && !priority.isEmpty()) {
            return ResponseEntity.ok(incidentService.getIncidentsByPriority(priority));
        }
        if (type != null && !type.isEmpty()) {
            return ResponseEntity.ok(incidentService.getIncidentsByType(type));
        }
        if (severity != null && !severity.isEmpty()) {
            return ResponseEntity.ok(incidentService.getIncidentsBySeverity(severity));
        }
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    // Admin endpoints
    @PutMapping("/{id}")
    public ResponseEntity<IncidentResponseDto> updateIncident(
            @PathVariable Long id,
            @RequestBody UpdateIncidentRequestDto requestDto) {
        IncidentResponseDto response = incidentService.updateIncident(id, requestDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<IncidentResponseDto> assignIncident(
            @PathVariable Long id,
            @RequestBody AssignIncidentRequestDto requestDto,
            @RequestHeader(value = "X-User-Id", required = false) Long adminId) {
        IncidentResponseDto response = incidentService.assignIncident(id, requestDto, adminId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/priority")
    public ResponseEntity<IncidentResponseDto> updatePriority(
            @PathVariable Long id,
            @RequestBody UpdateIncidentPriorityRequestDto requestDto,
            @RequestHeader(value = "X-User-Id", required = false) Long adminId) {
        IncidentResponseDto response = incidentService.updatePriority(id, requestDto, adminId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<IncidentResponseDto> resolveIncident(
            @PathVariable Long id,
            @RequestBody ResolveIncidentRequestDto requestDto,
            @RequestHeader(value = "X-User-Id", required = false) Long adminId) {
        IncidentResponseDto response = incidentService.resolveIncident(id, requestDto, adminId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    public ResponseEntity<List<IncidentResponseDto>> getActiveIncidents() {
        return ResponseEntity.ok(incidentService.getActiveIncidents());
    }

    @GetMapping("/assigned/{assignedTo}")
    public ResponseEntity<List<IncidentResponseDto>> getIncidentsByAssignedTo(@PathVariable Long assignedTo) {
        return ResponseEntity.ok(incidentService.getIncidentsByAssignedTo(assignedTo));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<IncidentHistoryResponseDto>> getIncidentHistory(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentHistory(id));
    }

    @GetMapping("/statistics")
    public ResponseEntity<IncidentStatisticsDto> getIncidentStatistics() {
        return ResponseEntity.ok(incidentService.getIncidentStatistics());
    }
}

