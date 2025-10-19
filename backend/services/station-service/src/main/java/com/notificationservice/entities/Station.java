// FILE: Station.java
package com.notificationservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "stations")
public class Station {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "station_id")
    private Long stationId;

    @Column(name = "station_code", unique = true, nullable = false)
    private String stationCode;

    @Column(name = "station_name", nullable = false)
    private String stationName;

    // Các trường JSON sẽ được xử lý sau, tạm thời để kiểu String
    @Column(columnDefinition = "JSON")
    private String location;

    @Enumerated(EnumType.STRING)
    private StationStatus status = StationStatus.online;

    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum StationStatus {
        online, offline, maintenance, closed
    }
}