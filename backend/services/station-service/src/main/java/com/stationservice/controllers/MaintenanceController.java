// FILE: MaintenanceController.java
package com.stationservice.controllers;

import com.stationservice.dtos.CreateMaintenanceScheduleRequestDto;
import com.stationservice.dtos.MaintenanceScheduleResponseDto;
import com.stationservice.dtos.UpdateMaintenanceScheduleRequestDto;
import com.stationservice.services.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    public ResponseEntity<MaintenanceScheduleResponseDto> createSchedule(
            @RequestBody CreateMaintenanceScheduleRequestDto requestDto) {
        MaintenanceScheduleResponseDto response = maintenanceService.createSchedule(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceScheduleResponseDto> updateSchedule(
            @PathVariable Long id,
            @RequestBody UpdateMaintenanceScheduleRequestDto requestDto) {
        MaintenanceScheduleResponseDto response = maintenanceService.updateSchedule(id, requestDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceScheduleResponseDto> getScheduleById(@PathVariable Long id) {
        MaintenanceScheduleResponseDto response = maintenanceService.getScheduleById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceScheduleResponseDto>> getAllSchedules(
            @RequestParam(required = false) Long stationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long assignedTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        if (stationId != null) {
            return ResponseEntity.ok(maintenanceService.getSchedulesByStationId(stationId));
        }
        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(maintenanceService.getSchedulesByStatus(status));
        }
        if (assignedTo != null) {
            return ResponseEntity.ok(maintenanceService.getSchedulesByAssignedTo(assignedTo));
        }
        if (from != null && to != null) {
            return ResponseEntity.ok(maintenanceService.getUpcomingSchedules(from, to));
        }
        return ResponseEntity.ok(maintenanceService.getAllSchedules());
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<MaintenanceScheduleResponseDto> startMaintenance(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long adminId) {
        MaintenanceScheduleResponseDto response = maintenanceService.startMaintenance(id, adminId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<MaintenanceScheduleResponseDto> completeMaintenance(
            @PathVariable Long id,
            @RequestParam(required = false) String notes,
            @RequestHeader(value = "X-User-Id", required = false) Long adminId) {
        MaintenanceScheduleResponseDto response = maintenanceService.completeMaintenance(id, adminId, notes);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        maintenanceService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}

