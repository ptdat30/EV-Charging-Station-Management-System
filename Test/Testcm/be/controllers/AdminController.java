package com.quitsmoking.controllers;
import com.quitsmoking.model.User;
import com.quitsmoking.services.AdminService;
import com.quitsmoking.services.UserStatusService;
import com.quitsmoking.dto.response.AdminStatsResponse;
import com.quitsmoking.dto.response.UserAdminResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import com.quitsmoking.dto.response.FeedbackResponse;
/**
 * Controller cho các chức năng quản trị hệ thống
 * Chỉ cho phép ADMIN truy cập
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private UserStatusService userStatusService;

    /**
     * Lấy thống kê tổng quan hệ thống
     */
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getSystemStats() {
        AdminStatsResponse stats = adminService.getSystemStats();
        return ResponseEntity.ok(stats);
    }
    /**
     * Quản lý người dùng - Lấy danh sách tất cả người dùng
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserAdminResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search) {
        List<UserAdminResponse> users = adminService.getAllUsers(page, size, sortBy, sortDir, search);
        return ResponseEntity.ok(users);
    }
    /**
     * Lấy thông tin chi tiết người dùng
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable String userId) {
        try {
            User user = adminService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Create a DTO to avoid Hibernate proxy issues
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("firstName", user.getFirstName());
            userInfo.put("lastName", user.getLastName());
            userInfo.put("role", user.getRole());
            userInfo.put("authProvider", user.getAuthProvider());
            userInfo.put("gender", user.getGender());
            userInfo.put("dateOfBirth", user.getDateOfBirth());
            userInfo.put("phoneNumber", user.getPhoneNumber());
            userInfo.put("pictureUrl", user.getPictureUrl());
            userInfo.put("createdAt", user.getCreatedAt());
            userInfo.put("updatedAt", user.getUpdatedAt());
            userInfo.put("enabled", user.isEnabled());
            userInfo.put("freePlanClaimed", user.isFreePlanClaimed());
            
            // Handle membership info safely - avoid accessing proxy objects
            try {
                if (user.getCurrentMembershipPlan() != null) {
                    Map<String, Object> membershipInfo = new HashMap<>();
                    membershipInfo.put("id", user.getCurrentMembershipPlan().getId());
                    membershipInfo.put("planName", user.getCurrentMembershipPlan().getPlanName());
                    membershipInfo.put("planType", user.getCurrentMembershipPlan().getPlanType());
                    userInfo.put("currentMembershipPlan", membershipInfo);
                }
            } catch (Exception e) {
                // If we can't access membership plan due to proxy issues, just skip it
                System.err.println("Could not access membership plan for user " + userId + ": " + e.getMessage());
                userInfo.put("currentMembershipPlan", null);
            }
            
            userInfo.put("membershipStartDate", user.getMembershipStartDate());
            userInfo.put("membershipEndDate", user.getMembershipEndDate());
            
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to retrieve user information: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    /**
     * Khóa/Mở khóa tài khoản người dùng
     */
    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<Map<String, Object>> banUser(@PathVariable String userId) {
        Map<String, Object> result = adminService.banUser(userId);
        return ResponseEntity.ok(result);
    }
    @PostMapping("/users/{userId}/unban")
    public ResponseEntity<Map<String, Object>> unbanUser(@PathVariable String userId) {
        Map<String, Object> result = adminService.unbanUser(userId);
        return ResponseEntity.ok(result);
    }
    /**
     * Nâng cấp/Hạ cấp vai trò người dùng
     */
    @PostMapping("/users/{userId}/update-role")
    public ResponseEntity<Map<String, Object>> updateUserRole(@PathVariable String userId, @RequestBody Map<String, String> request) {
        String newRole = request.get("role");
        Map<String, Object> result = new HashMap<>();
        if (newRole == null || !(newRole.equals("GUEST") || newRole.equals("MEMBER") || newRole.equals("COACH"))) {
            result.put("success", false);
            result.put("message", "Role không hợp lệ!");
            return ResponseEntity.badRequest().body(result);
        }
        try {
            User user = adminService.updateUserRole(userId, newRole);
            UserAdminResponse userDto = new UserAdminResponse(user);
            result.put("success", true);
            result.put("user", userDto);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }
    /**
     * Quản lý huấn luyện viên - Lấy danh sách
     */
    @GetMapping("/coaches")
    public ResponseEntity<List<User>> getAllCoaches() {
        List<User> coaches = adminService.getAllCoaches();
        return ResponseEntity.ok(coaches);
    }
    /**
     * Thêm huấn luyện viên mới
     */
    @PostMapping("/coaches")
    public ResponseEntity<User> addCoach(@RequestBody Map<String, Object> coachData) {
        User coach = adminService.addCoach(coachData);
        return ResponseEntity.ok(coach);
    }
    /**
     * Cập nhật thông tin huấn luyện viên
     */
    @PutMapping("/coaches/{coachId}")
    public ResponseEntity<User> updateCoach(
            @PathVariable String coachId,
            @RequestBody Map<String, Object> coachData) {
        
        User coach = adminService.updateCoach(coachId);
        return ResponseEntity.ok(coach);
    }
    /**
     * Xóa huấn luyện viên
     */
    @DeleteMapping("/coaches/{coachId}")
    public ResponseEntity<Map<String, Object>> removeCoach(@PathVariable String coachId) {
        Map<String, Object> result = adminService.removeCoach(coachId);
        return ResponseEntity.ok(result);
    }
    /**
     * Báo cáo hệ thống
     */
    @GetMapping("/reports")
    public ResponseEntity<List<Object>> getSystemReports(
            @RequestParam(required = false) String reportType,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        List<Object> reports = adminService.getSystemReports(reportType, startDate, endDate);
        return ResponseEntity.ok(reports);
    }
    /**
     * Báo cáo doanh thu
     */
    @GetMapping("/reports/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport(
            @RequestParam(required = false) String period) {
        
        Map<String, Object> revenueReport = adminService.getRevenueReport(period);
        return ResponseEntity.ok(revenueReport);
    }
    /**
     * Báo cáo người dùng hoạt động
     */
    @GetMapping("/reports/user-activity")
    public ResponseEntity<Map<String, Object>> getUserActivityReport(
            @RequestParam(required = false) String period) {
        
        Map<String, Object> activityReport = adminService.getUserActivityReport(period);
        return ResponseEntity.ok(activityReport);
    }
    /**
     * Lấy phản hồi từ người dùng
     */
    @GetMapping("/feedbacks")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedbacks( // Đã thay đổi kiểu trả về tại đây
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        List<FeedbackResponse> feedbacks = adminService.getAllFeedbacks(page, size);
        return ResponseEntity.ok(feedbacks);
    }
    /**
     * Trả lời phản hồi
     */
    @PostMapping("/feedbacks/{feedbackId}/reply")
    public ResponseEntity<Object> replyToFeedback(
            @PathVariable String feedbackId,
            @RequestBody Map<String, String> reply,
            @AuthenticationPrincipal User admin) {
        
        Object result = adminService.replyToFeedback(feedbackId, reply.get("message"), admin.getId());
        return ResponseEntity.ok(result);
    }
    /**
     * Cài đặt hệ thống
     */
    @GetMapping("/system/settings")
    public ResponseEntity<Map<String, Object>> getSystemSettings() {
        AdminStatsResponse statsResponse = adminService.getSystemStats();
        Map<String, Object> settings = Map.of(
            "totalUsers", statsResponse.getTotalUsers(),
            "activeUsers", statsResponse.getActiveUsers(),
            "totalRevenue", statsResponse.getTotalRevenue()
            // Add other fields as needed
        );
        return ResponseEntity.ok(settings);
    }
    @PostMapping("/system/settings")
    public ResponseEntity<Map<String, Object>> updateSystemSettings(
            @RequestBody Map<String, Object> settings) {
        
        Map<String, Object> result = adminService.updateSystemSettings(settings);
        return ResponseEntity.ok(result);
    }
    /**
     * Backup dữ liệu
     */
    @PostMapping("/system/backup")
    public ResponseEntity<Map<String, Object>> createBackup() {
        Map<String, Object> result = adminService.createBackup();
        return ResponseEntity.ok(result);
    }
    /**
     * Thống kê theo thời gian thực
     */
    @GetMapping("/stats/realtime")
    public ResponseEntity<Map<String, Object>> getRealtimeStats() {
        Map<String, Object> stats = adminService.getRealtimeStats();
        return ResponseEntity.ok(stats);
    }
    /**
     * Log hệ thống
     */
    @GetMapping("/system/logs")
    public ResponseEntity<List<Object>> getSystemLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String level) {
        
        List<Object> logs = adminService.getSystemReports(page, size, level);
        return ResponseEntity.ok(logs);
    }
    /**
     * Lấy trạng thái online/offline của tất cả người dùng
     */
    @GetMapping("/users/status")
    public ResponseEntity<Map<String, Boolean>> getAllUserStatuses() {
        Map<String, Boolean> userStatuses = userStatusService.getAllUserStatuses();
        return ResponseEntity.ok(userStatuses);
    }
    /**
     * Lấy trạng thái online/offline của một người dùng cụ thể
     */
    @GetMapping("/users/{userId}/status")
    public ResponseEntity<Map<String, Object>> getUserStatus(@PathVariable String userId) {
        boolean isOnline = userStatusService.isUserOnline(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("online", isOnline);
        
        // Lấy lastSeen nếu có
        Map<String, java.time.LocalDateTime> userStatusMap = userStatusService.getUserStatusMap();
        java.time.LocalDateTime lastSeen = userStatusMap.get(userId);
        if (lastSeen != null) {
            result.put("lastSeen", lastSeen.toString());
        }
        
        return ResponseEntity.ok(result);
    }
    /**
     * Kiểm tra xem người dùng có online không
     */
    @GetMapping("/users/{userId}/online")
    public ResponseEntity<Map<String, Object>> isUserOnline(@PathVariable String userId) {
        boolean isOnline = userStatusService.isUserOnline(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("online", isOnline);
        return ResponseEntity.ok(result);
    }
}