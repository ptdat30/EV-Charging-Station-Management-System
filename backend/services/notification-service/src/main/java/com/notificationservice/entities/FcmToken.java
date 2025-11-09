package com.notificationservice.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "fcm_tokens", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_token", columnList = "token")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FcmToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fcm_token_id")
    private Long fcmTokenId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "token", nullable = false, unique = true, length = 500)
    private String token;
    
    @Column(name = "device_type", length = 50)
    private String deviceType; // ANDROID, IOS, WEB
    
    @Column(name = "device_id", length = 255)
    private String deviceId;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
}

