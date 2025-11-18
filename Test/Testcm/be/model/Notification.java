package com.quitsmoking.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "VARCHAR(36)")
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false, length = 200)
    private String title;
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType notificationType;
    @Column(name = "is_read")
    private boolean isRead = false;
    @Column(name = "scheduled_time")
    private LocalDateTime scheduledTime;
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
    }
    public Notification(User user, String title, String message, NotificationType notificationType) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.notificationType = notificationType;
    }
    public enum NotificationType {
        MOTIVATION,
        ACHIEVEMENT,
        REMINDER,
        SYSTEM
    }
}
