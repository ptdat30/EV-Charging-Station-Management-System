package com.quitsmoking.dto.response;

import com.quitsmoking.model.MembershipPlan;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MembershipPlanResponse {
    private String id;
    private String planName;
    private String description;
    private BigDecimal price;
    private int durationDays;
    private String planType; // Thêm nếu bạn muốn hiển thị loại gói (ví dụ: THIRTY_DAYS_TRIAL)
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor để chuyển đổi từ MembershipPlan Entity sang DTO
    public MembershipPlanResponse(MembershipPlan membershipPlan) {
        this.id = membershipPlan.getId();
        this.planName = membershipPlan.getPlanName();
        this.description = membershipPlan.getDescription();
        this.price = membershipPlan.getPrice();
        this.durationDays = membershipPlan.getDurationDays();
        this.planType = membershipPlan.getPlanType() != null ? membershipPlan.getPlanType().name() : null;
        this.isActive = membershipPlan.getIsActive();
        this.createdAt = membershipPlan.getCreatedAt();
        this.updatedAt = membershipPlan.getUpdatedAt();
    }

    // --- Getters and Setters --- (Bạn có thể dùng Lombok để tự động tạo)
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(int durationDays) {
        this.durationDays = durationDays;
    }

    public String getPlanType() {
        return planType;
    }

    public void setPlanType(String planType) {
        this.planType = planType;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
