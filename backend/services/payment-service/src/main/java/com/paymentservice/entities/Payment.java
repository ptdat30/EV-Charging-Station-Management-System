// FILE: Payment.java
package com.paymentservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;

    // [COMMAND]: ID của phiên sạc (từ charging-service) - nullable cho deposit payments
    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    // Store price per kWh used for this payment
    // This ensures old payments are not affected by price changes
    @Column(name = "price_per_kwh", precision = 10, scale = 2)
    private BigDecimal pricePerKwh;

    // Store energy consumed for this payment (optional, for reporting)
    @Column(name = "energy_consumed", precision = 10, scale = 2)
    private BigDecimal energyConsumed;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.pending;

    @Column(name = "payment_time")
    private LocalDateTime paymentTime;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum PaymentMethod {
        wallet, e_wallet, banking, credit_card, debit_card, cash, qr_payment
    }

    public enum PaymentStatus {
        pending, processing, completed, failed, refunded, cancelled
    }
}