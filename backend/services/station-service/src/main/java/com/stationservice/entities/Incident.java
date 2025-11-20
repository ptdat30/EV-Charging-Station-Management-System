// FILE: Incident.java
package com.stationservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "incident_id")
    private Long incidentId;

    @Column(name = "station_id", nullable = false)
    private Long stationId;

    @Column(name = "charger_id")
    private Long chargerId; // nullable - có thể là sự cố chung của trạm

    @Enumerated(EnumType.STRING)
    @Column(name = "incident_type", nullable = false)
    private IncidentType incidentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private Severity severity;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "user_id")
    private Long userId; // ID của user báo cáo (từ user-service)

    @Column(name = "reported_by")
    private String reportedBy; // Tên nhân viên hoặc người báo cáo

    @Column(name = "assigned_to")
    private Long assignedTo; // ID của staff/admin được phân công xử lý

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private Priority priority = Priority.medium;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.pending;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes; // Ghi chú về cách xử lý

    @Column(name = "resolution_rating")
    private Integer resolutionRating; // Đánh giá hiệu quả (1-5)

    @Column(name = "estimated_resolution_time")
    private LocalDateTime estimatedResolutionTime; // Thời gian dự kiến xử lý xong

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    public enum IncidentType {
        equipment, power, network, other
    }

    public enum Severity {
        low, medium, high, critical
    }

    public enum Status {
        pending, in_progress, resolved, closed, cancelled
    }

    public enum Priority {
        low, medium, high, urgent
    }
}

