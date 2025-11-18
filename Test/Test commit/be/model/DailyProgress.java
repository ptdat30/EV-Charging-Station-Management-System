package com.quitsmoking.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity
@Table(name = "daily_progress")
@Getter
@Setter
@NoArgsConstructor

public class DailyProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "VARCHAR(36)")
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quit_plan_id")
    private QuitPlan quitPlan;
    @Column(nullable = false)
    private LocalDate date;
    @Column(name = "cigarettes_smoked")
    private int cigarettesSmoked = 0;
    @Column(name = "mood_rating")
    private int moodRating; // 1-10
    @Column(name = "stress_level")
    private int stressLevel; // 1-10
    @Column(name = "cravings_intensity")
    private int cravingsIntensity; // 1-10
    @Column(name = "exercise")
    private Boolean exercise;
    @Column(name = "water")
    private Integer water;
    @Column(name = "sleep")
    private Integer sleep;
    @Column(name = "smoked_today")
    private Boolean smokedToday;
    @Column(name = "cigarettes_today")
    private Integer cigarettesToday;
    @Column(name = "money_spent_today", precision = 10, scale = 2)
    private BigDecimal moneySpentToday;
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
    @Column(name = "money_saved", precision = 10, scale = 2)
    private BigDecimal moneySaved = BigDecimal.ZERO;
    @Column(name = "health_improvements", columnDefinition = "TEXT")
    private String healthImprovements; // JSON string
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
    }
    public DailyProgress(User user, LocalDate date) {
        this.user = user;
        this.date = date;
    }
    public DailyProgress(User user, QuitPlan quitPlan, LocalDate date, int cigarettesSmoked) {
        this.user = user;
        this.quitPlan = quitPlan;
        this.date = date;
        this.cigarettesSmoked = cigarettesSmoked;
    }
}