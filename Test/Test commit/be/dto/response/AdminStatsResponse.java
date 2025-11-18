package com.quitsmoking.dto.response;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
/**
 * DTO cho thống kê admin dashboard
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    // Thống kê người dùng
    private Long totalUsers;
    private Long activeUsers;
    private Long newUsersThisMonth;
    private Long bannedUsers;
    // Thống kê kế hoạch cai thuốc
    private Long totalPlans;
    private Long activePlans;
    private Long completedPlans;
    private Long successfulQuits;
    // Thống kê doanh thu
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal yearlyRevenue;
    private Long totalTransactions;
    // Thống kê membership
    private Long freeMembers;
    private Long basicMembers;
    private Long premiumMembers;
    private Long vipMembers;
    // Thống kê huấn luyện viên
    private Long totalCoaches;
    private Long activeCoaches;
    private Long totalConsultations;
    // Thống kê community
    private Long totalPosts;
    private Long totalComments;
    private Long activeDiscussions;
    // Thống kê thành tích
    private Long totalAchievements;
    private Long achievementsEarned;
    // Thống kê hệ thống
    private LocalDateTime lastBackup;
    private Long systemUptime;
    private String systemHealth;
    // Thống kê hoạt động gần đây
    private Long dailyActiveUsers;
    private Long weeklyActiveUsers;
    private Long monthlyActiveUsers;
    // Builder pattern methods
    public static AdminStatsResponse builder() {
        return new AdminStatsResponse();
    }
    public AdminStatsResponse totalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
        return this;
    }
    public AdminStatsResponse activeUsers(Long activeUsers) {
        this.activeUsers = activeUsers;
        return this;
    }
    public AdminStatsResponse newUsersThisMonth(Long newUsersThisMonth) {
        this.newUsersThisMonth = newUsersThisMonth;
        return this;
    }
    public AdminStatsResponse totalPlans(Long totalPlans) {
        this.totalPlans = totalPlans;
        return this;
    }
    public AdminStatsResponse successfulQuits(Long successfulQuits) {
        this.successfulQuits = successfulQuits;
        return this;
    }
    public AdminStatsResponse totalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
        return this;
    }
    public AdminStatsResponse totalCoaches(Long totalCoaches) {
        this.totalCoaches = totalCoaches;
        return this;
    }
}