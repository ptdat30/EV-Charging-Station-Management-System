package com.quitsmoking.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;
@Entity
@Table(name = "achievements")
@Getter
@Setter
@NoArgsConstructor
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "VARCHAR(36)")
    private String id;
    @Column(nullable = false)
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(name = "icon_url", columnDefinition = "TEXT")
    private String iconUrl;
    @Enumerated(EnumType.STRING)
    @Column(name = "criteria_type", nullable = false)
    private CriteriaType criteriaType;
    @Column(name = "criteria_value", nullable = false)
    private int criteriaValue;
    @Column(name = "badge_color")
    private String badgeColor = "GOLD";
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
    }
    public Achievement(String name, String description, CriteriaType criteriaType, int criteriaValue) {
        this.name = name;
        this.description = description;
        this.criteriaType = criteriaType;
        this.criteriaValue = criteriaValue;
    }
    public enum CriteriaType {
        DAYS_SMOKE_FREE,
        MONEY_SAVED,
        CIGARETTES_AVOIDED,
        MILESTONES
    }
}
