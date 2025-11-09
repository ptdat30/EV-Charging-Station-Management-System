package com.chargingservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Long reservationId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "station_id", nullable = false)
    private Long stationId;

    @Column(name = "charger_id")
    private Long chargerId;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "reserved_start_time", nullable = false)
    private LocalDateTime reservedStartTime;

    @Column(name = "reserved_end_time", nullable = false)
    private LocalDateTime reservedEndTime;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.pending;

    @Column(name = "qr_code")
    private String qrCode;

    @Column(name = "confirmation_code", length = 20)
    private String confirmationCode;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    // Deposit/Payment fields
    @Column(name = "deposit_amount", precision = 15, scale = 2)
    private java.math.BigDecimal depositAmount;

    @Column(name = "deposit_payment_id")
    private Long depositPaymentId; // Reference to payment record for deposit

    @Column(name = "deposit_refunded")
    private Boolean depositRefunded = false;

    // Check-in fields
    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_in_deadline") // reservedStartTime + 15 minutes
    private LocalDateTime checkInDeadline;

    @Column(name = "is_checked_in")
    private Boolean isCheckedIn = false;

    // No-show tracking
    @Column(name = "no_show_count")
    private Integer noShowCount = 0;

    @Column(name = "no_show_penalty_applied")
    private Boolean noShowPenaltyApplied = false;

    // Notification tracking
    @Column(name = "reminder_sent")
    private Boolean reminderSent = false;

    @Column(name = "reminder_sent_at")
    private LocalDateTime reminderSentAt;

    // Priority level based on subscription package (0 = no subscription, 1 = SILVER, 2 = GOLD, 3 = PLATINUM)
    @Column(name = "priority_level")
    private Integer priorityLevel = 0;

    @Column(name = "subscription_package")
    private String subscriptionPackage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ReservationStatus {
        pending, confirmed, active, completed, cancelled, expired, no_show
    }
}

