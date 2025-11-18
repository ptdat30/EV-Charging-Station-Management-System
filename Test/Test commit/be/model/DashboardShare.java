package com.quitsmoking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class DashboardShare {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String memberId;
    private String coachId;
    private LocalDateTime sharedAt;

    // getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) { this.memberId = memberId; }
    public String getCoachId() { return coachId; }
    public void setCoachId(String coachId) { this.coachId = coachId; }
    public LocalDateTime getSharedAt() { return sharedAt; }
    public void setSharedAt(LocalDateTime sharedAt) { this.sharedAt = sharedAt; }
}