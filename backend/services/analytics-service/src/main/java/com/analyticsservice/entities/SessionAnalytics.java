// FILE: SessionAnalytics.java
package com.analyticsservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "session_analytics")
public class SessionAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analytics_id")
    private Long analyticsId;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "station_id")
    private Long stationId;

    @Column(name = "charging_point_id")
    private Long chargingPointId;

    @Column(name = "energy_consumed", precision = 10, scale = 2)
    private BigDecimal energyConsumed; // kWh

    @Column(name = "session_duration") // in minutes
    private Integer sessionDuration;

    @Column(name = "cost", precision = 15, scale = 2)
    private BigDecimal cost;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "day_of_week")
    private String dayOfWeek; // MONDAY, TUESDAY, etc.

    @Column(name = "hour_of_day")
    private Integer hourOfDay; // 0-23

    @Column(name = "is_peak_hour")
    private Boolean isPeakHour;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

