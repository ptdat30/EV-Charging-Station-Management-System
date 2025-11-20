// FILE: MaintenanceScheduleRepository.java
package com.stationservice.repositories;

import com.stationservice.entities.MaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceSchedule, Long> {
    List<MaintenanceSchedule> findByStationIdOrderByScheduledStartTimeAsc(Long stationId);
    List<MaintenanceSchedule> findByStatusOrderByScheduledStartTimeAsc(MaintenanceSchedule.Status status);
    List<MaintenanceSchedule> findByAssignedToOrderByScheduledStartTimeAsc(Long assignedTo);
    List<MaintenanceSchedule> findByScheduledStartTimeBetween(LocalDateTime start, LocalDateTime end);
    List<MaintenanceSchedule> findAllByOrderByScheduledStartTimeAsc();
}

