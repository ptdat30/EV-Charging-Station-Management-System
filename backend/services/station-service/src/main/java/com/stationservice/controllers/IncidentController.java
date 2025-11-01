// FILE: IncidentController.java
package com.stationservice.controllers;

import com.stationservice.dtos.CreateIncidentRequestDto;
import com.stationservice.dtos.IncidentResponseDto;
import com.stationservice.dtos.UpdateIncidentRequestDto;
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

    @PostMapping
    public ResponseEntity<IncidentResponseDto> createIncident(@RequestBody CreateIncidentRequestDto requestDto) {
        IncidentResponseDto response = incidentService.createIncident(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentResponseDto> updateIncident(
            @PathVariable Long id,
            @RequestBody UpdateIncidentRequestDto requestDto) {
        IncidentResponseDto response = incidentService.updateIncident(id, requestDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponseDto> getIncidentById(@PathVariable Long id) {
        IncidentResponseDto response = incidentService.getIncidentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<IncidentResponseDto>> getAllIncidents(
            @RequestParam(required = false) Long stationId,
            @RequestParam(required = false) String status) {
        if (stationId != null) {
            return ResponseEntity.ok(incidentService.getIncidentsByStationId(stationId));
        }
        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(incidentService.getIncidentsByStatus(status));
        }
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }
}

