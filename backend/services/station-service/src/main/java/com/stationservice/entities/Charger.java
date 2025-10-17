// FILE: Charger.java
package com.stationservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "chargers")
public class Charger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "charger_id")
    private Long chargerId;

    // [COMMAND]: Thiết lập mối quan hệ nhiều-một với Station.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @Column(name = "charger_code", unique = true, nullable = false)
    private String chargerCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "charger_type", nullable = false)
    private ChargerType chargerType;

    @Column(name = "power_rating", nullable = false, precision = 6, scale = 2)
    private BigDecimal powerRating;

    @Enumerated(EnumType.STRING)
    private ChargerStatus status = ChargerStatus.available;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum ChargerType {
        CCS, CHAdeMO, AC_Type2, GB_T
    }

    public enum ChargerStatus {
        available, in_use, offline, maintenance, reserved
    }
}