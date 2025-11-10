// FILE: DailyReport.java
package com.analyticsservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "daily_reports")
public class DailyReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "report_date", unique = true)
    private LocalDate reportDate;

    @Column(name = "total_sessions")
    private Integer totalSessions;

    @Column(name = "total_energy_consumed", precision = 15, scale = 2)
    private BigDecimal totalEnergyConsumed;

    @Column(name = "total_revenue", precision = 15, scale = 2)
    private BigDecimal totalRevenue;

    @Column(name = "unique_users")
    private Integer uniqueUsers;

    @Column(name = "average_session_duration")
    private Integer averageSessionDuration; // minutes

    @Column(name = "peak_hour_start")
    private Integer peakHourStart; // 0-23

    @Column(name = "peak_hour_end")
    private Integer peakHourEnd; // 0-23

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

