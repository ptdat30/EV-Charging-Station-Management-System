// FILE: MaintenanceServiceImpl.java
package com.stationservice.services;

import com.stationservice.dtos.CreateMaintenanceScheduleRequestDto;
import com.stationservice.dtos.MaintenanceScheduleResponseDto;
import com.stationservice.dtos.UpdateMaintenanceScheduleRequestDto;
import com.stationservice.entities.MaintenanceSchedule;
import com.stationservice.entities.Station;
import com.stationservice.exceptions.ResourceNotFoundException;
import com.stationservice.repositories.MaintenanceScheduleRepository;
import com.stationservice.repositories.StationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceServiceImpl implements MaintenanceService {

    private static final Logger log = LoggerFactory.getLogger(MaintenanceServiceImpl.class);
    private final MaintenanceScheduleRepository scheduleRepository;
    private final StationRepository stationRepository;

    @Override
    @Transactional
    public MaintenanceScheduleResponseDto createSchedule(CreateMaintenanceScheduleRequestDto requestDto) {
        log.info("Creating maintenance schedule for station {}", requestDto.getStationId());

        Station station = stationRepository.findById(requestDto.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + requestDto.getStationId()));

        MaintenanceSchedule schedule = new MaintenanceSchedule();
        schedule.setStationId(requestDto.getStationId());
        schedule.setChargerId(requestDto.getChargerId());
        schedule.setMaintenanceType(requestDto.getMaintenanceType());
        schedule.setTitle(requestDto.getTitle());
        schedule.setDescription(requestDto.getDescription());
        schedule.setScheduledStartTime(requestDto.getScheduledStartTime());
        schedule.setScheduledEndTime(requestDto.getScheduledEndTime());
        schedule.setAssignedTo(requestDto.getAssignedTo());
        schedule.setRecurrenceType(requestDto.getRecurrenceType());
        schedule.setRecurrenceInterval(requestDto.getRecurrenceInterval());
        schedule.setNotes(requestDto.getNotes());
        schedule.setStatus(MaintenanceSchedule.Status.scheduled);

        // Calculate next scheduled time for recurring maintenance
        if (schedule.getRecurrenceType() != null && schedule.getRecurrenceInterval() != null) {
            schedule.setNextScheduledTime(calculateNextScheduledTime(
                    requestDto.getScheduledStartTime(),
                    schedule.getRecurrenceType(),
                    schedule.getRecurrenceInterval()));
        }

        MaintenanceSchedule savedSchedule = scheduleRepository.save(schedule);
        log.info("Maintenance schedule created successfully. Schedule ID: {}", savedSchedule.getScheduleId());

        return convertToDto(savedSchedule, station);
    }

    @Override
    @Transactional
    public MaintenanceScheduleResponseDto updateSchedule(Long scheduleId, UpdateMaintenanceScheduleRequestDto requestDto) {
        log.info("Updating maintenance schedule {}", scheduleId);

        MaintenanceSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance schedule not found with id: " + scheduleId));

        if (requestDto.getTitle() != null) schedule.setTitle(requestDto.getTitle());
        if (requestDto.getDescription() != null) schedule.setDescription(requestDto.getDescription());
        if (requestDto.getScheduledStartTime() != null) schedule.setScheduledStartTime(requestDto.getScheduledStartTime());
        if (requestDto.getScheduledEndTime() != null) schedule.setScheduledEndTime(requestDto.getScheduledEndTime());
        if (requestDto.getAssignedTo() != null) schedule.setAssignedTo(requestDto.getAssignedTo());
        if (requestDto.getStatus() != null) schedule.setStatus(requestDto.getStatus());
        if (requestDto.getNotes() != null) schedule.setNotes(requestDto.getNotes());

        MaintenanceSchedule updatedSchedule = scheduleRepository.save(schedule);
        Station station = stationRepository.findById(updatedSchedule.getStationId()).orElse(null);

        return convertToDto(updatedSchedule, station);
    }

    @Override
    public MaintenanceScheduleResponseDto getScheduleById(Long scheduleId) {
        MaintenanceSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance schedule not found with id: " + scheduleId));

        Station station = stationRepository.findById(schedule.getStationId()).orElse(null);
        return convertToDto(schedule, station);
    }

    @Override
    public List<MaintenanceScheduleResponseDto> getAllSchedules() {
        List<MaintenanceSchedule> schedules = scheduleRepository.findAllByOrderByScheduledStartTimeAsc();
        return schedules.stream()
                .map(schedule -> {
                    Station station = stationRepository.findById(schedule.getStationId()).orElse(null);
                    return convertToDto(schedule, station);
                })
                .toList();
    }

    @Override
    public List<MaintenanceScheduleResponseDto> getSchedulesByStationId(Long stationId) {
        List<MaintenanceSchedule> schedules = scheduleRepository.findByStationIdOrderByScheduledStartTimeAsc(stationId);
        Station station = stationRepository.findById(stationId).orElse(null);
        return schedules.stream()
                .map(schedule -> convertToDto(schedule, station))
                .toList();
    }

    @Override
    public List<MaintenanceScheduleResponseDto> getSchedulesByStatus(String status) {
        try {
            MaintenanceSchedule.Status statusEnum = MaintenanceSchedule.Status.valueOf(status.toLowerCase());
            List<MaintenanceSchedule> schedules = scheduleRepository.findByStatusOrderByScheduledStartTimeAsc(statusEnum);
            return schedules.stream()
                    .map(schedule -> {
                        Station station = stationRepository.findById(schedule.getStationId()).orElse(null);
                        return convertToDto(schedule, station);
                    })
                    .toList();
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status: {}", status);
            return List.of();
        }
    }

    @Override
    public List<MaintenanceScheduleResponseDto> getSchedulesByAssignedTo(Long assignedTo) {
        List<MaintenanceSchedule> schedules = scheduleRepository.findByAssignedToOrderByScheduledStartTimeAsc(assignedTo);
        return schedules.stream()
                .map(schedule -> {
                    Station station = stationRepository.findById(schedule.getStationId()).orElse(null);
                    return convertToDto(schedule, station);
                })
                .toList();
    }

    @Override
    public List<MaintenanceScheduleResponseDto> getUpcomingSchedules(LocalDateTime from, LocalDateTime to) {
        List<MaintenanceSchedule> schedules = scheduleRepository.findByScheduledStartTimeBetween(from, to);
        return schedules.stream()
                .map(schedule -> {
                    Station station = stationRepository.findById(schedule.getStationId()).orElse(null);
                    return convertToDto(schedule, station);
                })
                .toList();
    }

    @Override
    @Transactional
    public MaintenanceScheduleResponseDto startMaintenance(Long scheduleId, Long adminId) {
        log.info("Starting maintenance schedule {}", scheduleId);

        MaintenanceSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance schedule not found with id: " + scheduleId));

        schedule.setStatus(MaintenanceSchedule.Status.in_progress);
        schedule.setActualStartTime(LocalDateTime.now());

        MaintenanceSchedule updatedSchedule = scheduleRepository.save(schedule);
        Station station = stationRepository.findById(updatedSchedule.getStationId()).orElse(null);

        return convertToDto(updatedSchedule, station);
    }

    @Override
    @Transactional
    public MaintenanceScheduleResponseDto completeMaintenance(Long scheduleId, Long adminId, String notes) {
        log.info("Completing maintenance schedule {}", scheduleId);

        MaintenanceSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance schedule not found with id: " + scheduleId));

        schedule.setStatus(MaintenanceSchedule.Status.completed);
        schedule.setActualEndTime(LocalDateTime.now());
        if (notes != null) {
            schedule.setNotes((schedule.getNotes() != null ? schedule.getNotes() + "\n" : "") + notes);
        }

        // If recurring, create next schedule
        if (schedule.getRecurrenceType() != null && schedule.getRecurrenceInterval() != null) {
            createNextRecurringSchedule(schedule);
        }

        MaintenanceSchedule updatedSchedule = scheduleRepository.save(schedule);
        Station station = stationRepository.findById(updatedSchedule.getStationId()).orElse(null);

        return convertToDto(updatedSchedule, station);
    }

    @Override
    @Transactional
    public void deleteSchedule(Long scheduleId) {
        MaintenanceSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance schedule not found with id: " + scheduleId));
        scheduleRepository.delete(schedule);
        log.info("Maintenance schedule {} deleted", scheduleId);
    }

    @Override
    @Transactional
    public void processRecurringSchedules() {
        log.info("Processing recurring maintenance schedules");
        // This would be called by a scheduled task
        // Check for schedules that need next occurrence created
        // Implementation can be added later if needed
    }

    private void createNextRecurringSchedule(MaintenanceSchedule original) {
        MaintenanceSchedule next = new MaintenanceSchedule();
        next.setStationId(original.getStationId());
        next.setChargerId(original.getChargerId());
        next.setMaintenanceType(original.getMaintenanceType());
        next.setTitle(original.getTitle());
        next.setDescription(original.getDescription());
        next.setScheduledStartTime(original.getNextScheduledTime());
        next.setScheduledEndTime(calculateEndTime(original.getNextScheduledTime(), 
                Duration.between(original.getScheduledStartTime(), original.getScheduledEndTime())));
        next.setAssignedTo(original.getAssignedTo());
        next.setRecurrenceType(original.getRecurrenceType());
        next.setRecurrenceInterval(original.getRecurrenceInterval());
        next.setStatus(MaintenanceSchedule.Status.scheduled);
        next.setNextScheduledTime(calculateNextScheduledTime(
                next.getScheduledStartTime(),
                next.getRecurrenceType(),
                next.getRecurrenceInterval()));

        scheduleRepository.save(next);
        log.info("Created next recurring maintenance schedule for station {}", original.getStationId());
    }

    private LocalDateTime calculateNextScheduledTime(LocalDateTime current, 
                                                     MaintenanceSchedule.RecurrenceType type, 
                                                     Integer interval) {
        return switch (type) {
            case daily -> current.plusDays(interval);
            case weekly -> current.plusWeeks(interval);
            case monthly -> current.plusMonths(interval);
            case quarterly -> current.plusMonths(interval * 3);
            case yearly -> current.plusYears(interval);
        };
    }

    private LocalDateTime calculateEndTime(LocalDateTime startTime, java.time.Duration duration) {
        return startTime.plus(duration);
    }

    private MaintenanceScheduleResponseDto convertToDto(MaintenanceSchedule schedule, Station station) {
        MaintenanceScheduleResponseDto dto = new MaintenanceScheduleResponseDto();
        dto.setScheduleId(schedule.getScheduleId());
        dto.setStationId(schedule.getStationId());
        dto.setStationName(station != null ? station.getStationName() : null);
        dto.setChargerId(schedule.getChargerId());
        dto.setMaintenanceType(schedule.getMaintenanceType());
        dto.setTitle(schedule.getTitle());
        dto.setDescription(schedule.getDescription());
        dto.setScheduledStartTime(schedule.getScheduledStartTime());
        dto.setScheduledEndTime(schedule.getScheduledEndTime());
        dto.setActualStartTime(schedule.getActualStartTime());
        dto.setActualEndTime(schedule.getActualEndTime());
        dto.setAssignedTo(schedule.getAssignedTo());
        dto.setStatus(schedule.getStatus());
        dto.setRecurrenceType(schedule.getRecurrenceType());
        dto.setRecurrenceInterval(schedule.getRecurrenceInterval());
        dto.setNextScheduledTime(schedule.getNextScheduledTime());
        dto.setNotes(schedule.getNotes());
        dto.setCreatedAt(schedule.getCreatedAt());
        dto.setUpdatedAt(schedule.getUpdatedAt());
        return dto;
    }
}

