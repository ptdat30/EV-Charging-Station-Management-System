// src/main/java/com/loyaltyservice/entities/LoyaltyAccount.java
package com.loyaltyservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "loyalty_accounts")
public class LoyaltyAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long accountId;

    @Column(name = "user_id", unique = true, nullable = false)
    private Long userId;

    @Column(name = "points_balance")
    private Integer pointsBalance = 0; // Đổi tên từ totalPoints

    @Column(name = "lifetime_points")
    private Integer lifetimePoints = 0; // Thêm trường mới

    @Enumerated(EnumType.STRING)
    @Column(name = "tier_level")
    private TierLevel tierLevel = TierLevel.bronze; // Đổi tên từ tier

    @Column(name = "tier_progress")
    private Integer tierProgress = 0; // Thêm trường mới

    @Column(name = "tier_updated_at")
    private LocalDateTime tierUpdatedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum TierLevel {
        bronze, silver, gold, platinum, diamond
    }
}