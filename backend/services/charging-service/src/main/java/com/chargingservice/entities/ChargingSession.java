// FILE: ChargingSession.java
package com.chargingservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "charging_sessions")
public class ChargingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Long sessionId;

    // [COMMAND]: Các ID này tham chiếu đến các service khác.
    // Tạm thời chúng ta chỉ lưu chúng dưới dạng Long.
    // Sau này, chúng ta sẽ dùng các cơ chế như FeignClient để lấy thông tin chi tiết.
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "station_id", nullable = false)
    private Long stationId;

    @Column(name = "charger_id", nullable = false)
    private Long chargerId;

    @Column(name = "session_code", unique = true, nullable = false)
    private String sessionCode;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "energy_consumed", precision = 10, scale = 2)
    private BigDecimal energyConsumed;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_status")
    private SessionStatus sessionStatus;

    // Payment tracking
    @Column(name = "is_paid")
    private Boolean isPaid = false;

    @Column(name = "payment_id")
    private Long paymentId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum SessionStatus {
        reserved, starting, charging, paused, completed, cancelled, failed, timeout
    }
}