// FILE: MaintenanceService.java
package com.stationservice.services;

import com.stationservice.dtos.CreateMaintenanceScheduleRequestDto;
import com.stationservice.dtos.MaintenanceScheduleResponseDto;
import com.stationservice.dtos.UpdateMaintenanceScheduleRequestDto;

import java.time.LocalDateTime;
import java.util.List;

public interface MaintenanceService {
    MaintenanceScheduleResponseDto createSchedule(CreateMaintenanceScheduleRequestDto requestDto);
    MaintenanceScheduleResponseDto updateSchedule(Long scheduleId, UpdateMaintenanceScheduleRequestDto requestDto);
    MaintenanceScheduleResponseDto getScheduleById(Long scheduleId);
    List<MaintenanceScheduleResponseDto> getAllSchedules();
    List<MaintenanceScheduleResponseDto> getSchedulesByStationId(Long stationId);
    List<MaintenanceScheduleResponseDto> getSchedulesByStatus(String status);
    List<MaintenanceScheduleResponseDto> getSchedulesByAssignedTo(Long assignedTo);
    List<MaintenanceScheduleResponseDto> getUpcomingSchedules(LocalDateTime from, LocalDateTime to);
    MaintenanceScheduleResponseDto startMaintenance(Long scheduleId, Long adminId);
    MaintenanceScheduleResponseDto completeMaintenance(Long scheduleId, Long adminId, String notes);
    void deleteSchedule(Long scheduleId);
    void processRecurringSchedules(); // Scheduled task to create next occurrences
}

