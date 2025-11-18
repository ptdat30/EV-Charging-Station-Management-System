package com.quitsmoking.model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.time.LocalTime;
/**
 * Entity quản lý cài đặt người dùng
 */
@Entity
@Table(name = "user_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {
    @Id
    @Column(name = "id", length = 36)
    private String id;
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
    // Cài đặt thông báo
    @Column(name = "daily_reminder", nullable = false)
    private Boolean dailyReminder = true;
    @Column(name = "weekly_report", nullable = false)
    private Boolean weeklyReport = true;
    @Column(name = "achievement_alert", nullable = false)
    private Boolean achievementAlert = true;
    @Column(name = "motivational_message", nullable = false)
    private Boolean motivationalMessage = true;
    @Column(name = "reminder_time")
    private LocalTime reminderTime = LocalTime.of(9, 0);
    // Cài đặt quyền riêng tư
    @Enumerated(EnumType.STRING)
    @Column(name = "profile_visibility", nullable = false)
    private ProfileVisibility profileVisibility = ProfileVisibility.PUBLIC;
    @Column(name = "share_achievements", nullable = false)
    private Boolean shareAchievements = true;
    @Column(name = "allow_coach_contact", nullable = false)
    private Boolean allowCoachContact = true;
    // Tùy chọn cá nhân
    @Column(name = "language", length = 5, nullable = false)
    private String language = "vi";
    @Enumerated(EnumType.STRING)
    @Column(name = "theme", nullable = false)
    private Theme theme = Theme.LIGHT;
    @Column(name = "currency", length = 3, nullable = false)
    private String currency = "VND";
    @Column(name = "date_format", length = 20, nullable = false)
    private String dateFormat = "DD/MM/YYYY";
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    // Enums
    public enum ProfileVisibility {
        PUBLIC, FRIENDS, PRIVATE
    }
    public enum Theme {
        LIGHT, DARK, AUTO
    }
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    // Constructor với User
    public UserSettings(User user) {
        this.id = user.getId();
        this.user = user;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}