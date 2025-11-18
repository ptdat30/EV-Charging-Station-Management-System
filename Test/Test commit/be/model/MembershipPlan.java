package com.quitsmoking.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Enumerated; // Quan trọng: để lưu enum
import jakarta.persistence.EnumType;   // Quan trọng: để lưu enum dưới dạng String (default)

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Nếu bạn dùng Lombok, có thể thêm @Data, @NoArgsConstructor, @AllArgsConstructor
// import lombok.Data;
// import lombok.NoArgsConstructor;
// import lombok.AllArgsConstructor;

@Entity
@Table(name = "membership_plans") // Tên bảng trong DB
// @Data // Nếu dùng Lombok
// @NoArgsConstructor // Nếu dùng Lombok
// @AllArgsConstructor // Nếu dùng Lombok
public class MembershipPlan {

    @Id
    @Column(name = "id", length = 50) // Đặt độ dài phù hợp với chuỗi ID của bạn
    private String id;

    @Column(name = "plan_name", nullable = false, unique = true)
    private String planName;

    @Column(name = "price", precision = 10, scale = 2) // Chính xác cho giá tiền
    private BigDecimal price; // Hoặc BigDecimal

    @Column(name = "duration_days") // Lưu số ngày trực tiếp
    private Integer durationDays;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active")
    private boolean isActive;

    // Tham chiếu đến enum MembershipPlanType (nếu bạn muốn phân loại gói)
    @Enumerated(EnumType.STRING) // Lưu tên enum dưới dạng String trong DB
    @Column(name = "plan_type")
    private MembershipPlanType planType; // Sử dụng enum mới ở đây nếu cần

    // --- Constructors (Nếu không dùng Lombok) ---
    public MembershipPlan() {}

    // Add constructor if needed, or rely on setters

    // --- Getters and Setters (Nếu không dùng Lombok) ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
    public MembershipPlanType getPlanType() { return planType; }
    public void setPlanType(MembershipPlanType planType) { this.planType = planType; }
}