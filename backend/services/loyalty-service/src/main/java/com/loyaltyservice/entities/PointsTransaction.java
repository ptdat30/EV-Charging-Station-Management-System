// src/main/java/com/loyaltyservice/entities/PointsTransaction.java
package com.loyaltyservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "points_transactions")
public class PointsTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId; // Đổi tên từ id

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @ToString.Exclude
    private LoyaltyAccount account; // Đổi tên từ loyaltyAccount

    @Column(nullable = false)
    private Integer points;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType type; // Đổi tên từ type

    @Column(name = "balance_after", nullable = false)
    private Integer balanceAfter; // Thêm trường mới

    @Column(name = "reference_type")
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    private String description;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum TransactionType {
        earn, redeem, expire, bonus, adjustment, refund
    }
}