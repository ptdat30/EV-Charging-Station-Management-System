// FILE: MaintenanceSchedule.java
package com.stationservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "maintenance_schedules")
public class MaintenanceSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    @Column(name = "station_id", nullable = false)
    private Long stationId;

    @Column(name = "charger_id")
    private Long chargerId; // nullable - có thể là bảo trì toàn trạm

    @Enumerated(EnumType.STRING)
    @Column(name = "maintenance_type", nullable = false)
    private MaintenanceType maintenanceType;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "scheduled_start_time", nullable = false)
    private LocalDateTime scheduledStartTime;

    @Column(name = "scheduled_end_time", nullable = false)
    private LocalDateTime scheduledEndTime;

    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    @Column(name = "assigned_to")
    private Long assignedTo; // ID của staff/admin được phân công

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.scheduled;

    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_type")
    private RecurrenceType recurrenceType; // null = one-time

    @Column(name = "recurrence_interval", columnDefinition = "INT")
    private Integer recurrenceInterval; // Số ngày/tuần/tháng

    @Column(name = "next_scheduled_time")
    private LocalDateTime nextScheduledTime; // Cho recurring maintenance

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum MaintenanceType {
        preventive, corrective, emergency, upgrade, inspection
    }

    public enum Status {
        scheduled, in_progress, completed, cancelled, skipped
    }

    public enum RecurrenceType {
        daily, weekly, monthly, quarterly, yearly
    }
}

