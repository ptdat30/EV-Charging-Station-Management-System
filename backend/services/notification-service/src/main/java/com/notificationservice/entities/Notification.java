// FILE: Notification.java
package com.notificationservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType notificationType;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "reference_id")
    private Long referenceId; // ID của session, payment,... liên quan

    @Column(name = "is_read")
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Enum cho các loại thông báo
    public enum NotificationType {
        charging_started, charging_complete, charging_failed,
        reservation_confirmed, reservation_reminder, reservation_cancelled,
        payment_success, payment_failed, wallet_low_balance,
        promotion, system_maintenance, station_offline,
        review_request, account_update, incident_reported
    }
}