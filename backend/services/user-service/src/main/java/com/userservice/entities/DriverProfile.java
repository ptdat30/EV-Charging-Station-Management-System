// src/main/java/com/userservice/entities/DriverProfile.java
package com.userservice.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

@Data
@Entity
@Table(name = "driver_profiles")
public class DriverProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long profileId;

    // Quan hệ OneToOne: Một DriverProfile thuộc về một User
    // FetchType.LAZY: Chỉ tải User khi thực sự cần truy cập
    // @ToString.Exclude để tránh vòng lặp vô hạn khi gọi toString()
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) // Khóa ngoại liên kết đến bảng users
    @ToString.Exclude // Quan trọng để tránh lỗi toString stack overflow
    private User user;

    // Các trường khác từ bảng driver_profiles
    @Column(name = "vehicle_info", columnDefinition = "JSON")
    private String vehicleInfo; // Tạm dùng String cho JSON, sẽ xử lý sau

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "emergency_contact")
    private String emergencyContact;

    @Column(name = "preferred_language")
    private String preferredLanguage;

    @Column(name = "notification_preferences", columnDefinition = "JSON")
    private String notificationPreferences; // Tạm dùng String

    @Column(name = "preferred_payment_method")
    private String preferredPaymentMethod;
}