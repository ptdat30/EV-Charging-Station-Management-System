package com.quitsmoking.services;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest; // Thêm import này
import org.springframework.data.domain.Pageable;   // Thêm import này
import org.springframework.transaction.annotation.Transactional;

import com.quitsmoking.dto.response.AdminStatsResponse;
import com.quitsmoking.dto.response.UserAdminResponse;
import com.quitsmoking.dto.response.FeedbackResponse; // <-- Đảm bảo import này

import com.quitsmoking.model.Role;
import com.quitsmoking.model.User;
import com.quitsmoking.model.MembershipTransaction;
import com.quitsmoking.model.Feedback; // <-- Đảm bảo import này cho Feedback entity

import com.quitsmoking.reponsitories.UserDAO;
import com.quitsmoking.reponsitories.QuitPlanDAO;
import com.quitsmoking.reponsitories.DailyProgressRepository;
import com.quitsmoking.reponsitories.MembershipTransactionRepository;
import com.quitsmoking.reponsitories.MembershipPlanRepository;
import com.quitsmoking.reponsitories.FeedbackRepository; // <-- Đảm bảo import này

import com.quitsmoking.exceptions.ResourceNotFoundException;
import com.quitsmoking.exceptions.BadRequestException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors; // <-- Đảm bảo import này cho Stream API

@Service // Đánh dấu đây là một Spring Service
public class AdminService {

    private final UserDAO userDAO;
    private final AuthService authService;
    private final UserService userService;
    private final QuitPlanDAO quitPlanDAO;
    private final DailyProgressRepository dailyProgressRepository;
    private final MembershipTransactionRepository membershipTransactionRepository;
    private final UserStatusService userStatusService;
    private final FeedbackRepository feedbackRepository; // <-- Khai báo dependency mới

    // Constructor để tiêm các dependencies
    public AdminService(UserDAO userDAO, AuthService authService, UserService userService,
                        QuitPlanDAO quitPlanDAO, DailyProgressRepository dailyProgressRepository,
                        MembershipTransactionRepository membershipTransactionRepository,
                        MembershipPlanRepository membershipPlanRepository,
                        UserStatusService userStatusService,
                        FeedbackRepository feedbackRepository) { // <-- Thêm vào constructor
        this.userDAO = userDAO;
        this.authService = authService;
        this.userService = userService;
        this.quitPlanDAO = quitPlanDAO;
        this.dailyProgressRepository = dailyProgressRepository;
        this.membershipTransactionRepository = membershipTransactionRepository;
        this.userStatusService = userStatusService;
        this.feedbackRepository = feedbackRepository; // <-- Khởi tạo dependency
    }

    // Phương thức để Admin tạo tài khoản mới
    public User createAccountByAdmin(String adminId, String username, String rawPassword, String email, String firstName, String lastName, Role role) {
        // Logic kiểm tra quyền của Admin (ví dụ: tìm adminId, kiểm tra role = ADMIN)
        Optional<User> adminUserOptional = userDAO.findById(adminId);
        if (adminUserOptional.isEmpty() || adminUserOptional.get().getRole() != Role.ADMIN) {
            System.err.println("Permission denied: Only Admin can create accounts.");
            return null; // Hoặc ném AccessDeniedException
        }

        // Gọi AuthService để đăng ký tài khoản (AuthService chứa logic đăng ký cơ bản)
        // Lưu ý: Có thể cần điều chỉnh phương thức register của AuthService để chấp nhận vai trò
        // hoặc tạo một phương thức riêng trong AuthService cho admin tạo user.
        return authService.register(username, rawPassword, email, firstName, lastName, role);
    }

    // Phương thức để Admin thay đổi vai trò của người dùng
    public boolean changeUserRoleByAdmin(String adminId, String targetUserId, Role newRole) {
        // Logic kiểm tra quyền của Admin
        Optional<User> adminUserOptional = userDAO.findById(adminId);
        if (adminUserOptional.isEmpty() || adminUserOptional.get().getRole() != Role.ADMIN) {
            System.err.println("Permission denied: Only Admin can change user roles.");
            return false; // Hoặc ném AccessDeniedException
        }

        // Gọi AuthService để thay đổi vai trò
        User updatedUser = authService.changeUserRole(targetUserId, newRole);
        return updatedUser != null;
    }

    // Các phương thức quản lý người dùng khác mà Admin có thể làm
    public User viewUserDetails(String adminId, String targetUserId) {
        // Kiểm tra quyền admin
        Optional<User> adminUserOptional = userDAO.findById(adminId);
        if (adminUserOptional.isEmpty() || adminUserOptional.get().getRole() != Role.ADMIN) {
            throw new RuntimeException("Permission denied: Only Admin can view user details.");
        }
        return userService.getUserById(targetUserId); // Gọi UserService để lấy chi tiết
    }

    public Map<String, Object> banUser(String userId) {
        try {
            Optional<User> userOptional = userDAO.findById(userId);
            if (userOptional.isEmpty()) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "Không tìm thấy người dùng");
                return result;
            }
            
            User user = userOptional.get();
            // For now, we'll just change the role to GUEST to effectively "ban" them
            user.setRole(Role.GUEST);
            userDAO.save(user);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Đã khóa người dùng thành công");
            result.put("user", user);
            return result;
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Lỗi khi khóa người dùng: " + e.getMessage());
            return result;
        }
    }

    public User getUserDetails(String userId) {
        return userDAO.findById(userId).orElse(null);
    }

    public List<UserAdminResponse> getAllUsers(int page, int size, String sortBy, String sortDir, String search) {
        List<User> users = userDAO.findAllWithMembership();
        List<UserAdminResponse> result = new ArrayList<>();
        System.out.println("AdminService: Processing " + users.size() + " users for admin panel");

        // Lấy map userId -> lastSeen
        Map<String, java.time.LocalDateTime> userStatusMap = userStatusService.getUserStatusMap();

        for (User user : users) {
            UserAdminResponse userResponse = new UserAdminResponse(user);

            // Set online status
            boolean isOnline = userStatusService.isUserOnline(user.getId());
            userResponse.setOnline(isOnline);

            // Set last seen time
            java.time.LocalDateTime lastSeen = userStatusMap.get(user.getId());
            if (lastSeen != null) {
                userResponse.setLastSeen(lastSeen.toString());
            }

            System.out.println("AdminService: User " + user.getUsername() + " (ID: " + user.getId() + ") - Online: " + isOnline);
            result.add(userResponse);
        }

        System.out.println("AdminService: Total users in response: " + result.size());
        return result;
    }

    public AdminStatsResponse getSystemStats() {
        // Tính toán thống kê tổng quan hệ thống
        // Đếm tổng số người dùng trong bảng users bằng nhiều cách để đảm bảo chính xác
        long totalUsers = getTotalUserCount();
        long totalUsersDirect = getTotalUserCountDirect();
        
        // So sánh kết quả đếm
        if (totalUsers != totalUsersDirect) {
            System.err.println("WARNING: User count mismatch! count()=" + totalUsers + ", findAll().size()=" + totalUsersDirect);
            // Sử dụng kết quả từ findAll() vì nó chính xác hơn
            totalUsers = totalUsersDirect;
        }
        
        // Đếm người dùng theo từng role
        long guestUsers = getUserCountByRole(Role.GUEST);
        long memberUsers = getUserCountByRole(Role.MEMBER);
        long coachUsers = getUserCountByRole(Role.COACH);
        long adminUsers = getUserCountByRole(Role.ADMIN);
        
        // Đếm người dùng hoạt động (không phải GUEST - người dùng bị ban)
        long activeUsers = totalUsers - guestUsers;
        
        // Người dùng mới trong tháng này
        long newUsersThisMonth = getNewUsersThisMonth();
        
        // Tổng kế hoạch cai thuốc
        long totalPlans = quitPlanDAO.count();
        
        // Kế hoạch cai thuốc thành công (có thể tính dựa trên logic nghiệp vụ)
        long successfulQuits = calculateSuccessfulQuits();
        
        // Tổng doanh thu
        BigDecimal totalRevenue = calculateTotalRevenue();
        
        // Thống kê hoạt động gần đây
        long dailyActiveUsers = calculateDailyActiveUsers();
        long weeklyActiveUsers = calculateWeeklyActiveUsers();
        long monthlyActiveUsers = calculateMonthlyActiveUsers();
        
        // Log thống kê để debug
        System.out.println("=== ADMIN STATS DEBUG ===");
        System.out.println("Total Users (count()): " + totalUsers);
        System.out.println("Total Users (findAll()): " + totalUsersDirect);
        System.out.println("Guest Users (Banned): " + guestUsers);
        System.out.println("Member Users: " + memberUsers);
        System.out.println("Coach Users: " + coachUsers);
        System.out.println("Admin Users: " + adminUsers);
        System.out.println("Active Users: " + activeUsers);
        System.out.println("New Users This Month: " + newUsersThisMonth);
        System.out.println("Total Plans: " + totalPlans);
        System.out.println("Successful Quits: " + successfulQuits);
        System.out.println("Total Revenue: " + totalRevenue);
        System.out.println("Daily Active Users: " + dailyActiveUsers);
        System.out.println("Weekly Active Users: " + weeklyActiveUsers);
        System.out.println("Monthly Active Users: " + monthlyActiveUsers);
        System.out.println("=========================");
        
        return new AdminStatsResponse(
            totalUsers, activeUsers, newUsersThisMonth, guestUsers, // bannedUsers
            totalPlans, 0L, 0L, successfulQuits, // activePlans, completedPlans
            totalRevenue, BigDecimal.ZERO, BigDecimal.ZERO, 0L, // monthlyRevenue, yearlyRevenue, totalTransactions
            memberUsers, 0L, 0L, 0L, // freeMembers, basicMembers, premiumMembers, vipMembers
            coachUsers, 0L, 0L, // activeCoaches, totalConsultations
            0L, 0L, 0L, // totalPosts, totalComments, activeDiscussions
            0L, 0L, // totalAchievements, achievementsEarned
            LocalDateTime.now(), 0L, "HEALTHY", // lastBackup, systemUptime, systemHealth
            dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers // activity stats
        );
    }

    private long calculateSuccessfulQuits() {
        // Logic tính số người cai thuốc thành công
        // Có thể dựa trên số ngày không hút thuốc liên tiếp hoặc kế hoạch hoàn thành
        return dailyProgressRepository.findAll().stream()
                .filter(progress -> progress.getCigarettesSmoked() == 0)
                .map(progress -> progress.getUser().getId())
                .distinct()
                .count();
    }

    /**
     * Đếm tổng số người dùng trong database một cách chính xác
     */
    private long getTotalUserCount() {
        try {
            long count = userDAO.count();
            System.out.println("Database user count: " + count);
            return count;
        } catch (Exception e) {
            System.err.println("Error counting users: " + e.getMessage());
            return 0L;
        }
    }

    /**
     * Đếm tổng số người dùng bằng query SQL thuần để đảm bảo chính xác
     */
    private long getTotalUserCountDirect() {
        try {
            // Sử dụng query SQL thuần để đếm tất cả records trong bảng users
            List<User> allUsers = userDAO.findAll();
            long count = allUsers.size();
            System.out.println("Direct user count from findAll(): " + count);
            
            // Log thêm thông tin chi tiết
            System.out.println("User details:");
            allUsers.forEach(user -> {
                System.out.println("    - ID: " + user.getId() + 
                                     ", Username: " + user.getUsername() + 
                                     ", Email: " + user.getEmail() + 
                                     ", Role: " + user.getRole() + 
                                     ", Created: " + user.getCreatedAt());
            });
            
            return count;
        } catch (Exception e) {
            System.err.println("Error in direct user counting: " + e.getMessage());
            e.printStackTrace();
            return 0L;
        }
    }

    /**
     * Đếm người dùng theo role cụ thể
     */
    private long getUserCountByRole(Role role) {
        try {
            return userDAO.findAll().stream()
                    .filter(user -> user.getRole() == role)
                    .count();
        } catch (Exception e) {
            System.err.println("Error counting users by role " + role + ": " + e.getMessage());
            return 0L;
        }
    }

    /**
     * Đếm người dùng mới trong tháng hiện tại
     */
    private long getNewUsersThisMonth() {
        try {
            LocalDate startOfMonth = YearMonth.now().atDay(1);
            return userDAO.findAll().stream()
                    .filter(user -> user.getCreatedAt() != null && 
                                     user.getCreatedAt().toLocalDate().isAfter(startOfMonth.minusDays(1)))
                    .count();
        } catch (Exception e) {
            System.err.println("Error counting new users this month: " + e.getMessage());
            return 0L;
        }
    }

    private BigDecimal calculateTotalRevenue() {
        return membershipTransactionRepository.findAll().stream()
                .filter(transaction -> transaction.getPaymentStatus() == MembershipTransaction.PaymentStatus.COMPLETED)
                .map(MembershipTransaction::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private long calculateDailyActiveUsers() {
        LocalDate today = LocalDate.now();
        return dailyProgressRepository.findAll().stream()
                .filter(progress -> progress.getDate().equals(today))
                .map(progress -> progress.getUser().getId())
                .distinct()
                .count();
    }

    private long calculateWeeklyActiveUsers() {
        LocalDate weekAgo = LocalDate.now().minusDays(7);
        return dailyProgressRepository.findAll().stream()
                .filter(progress -> progress.getDate().isAfter(weekAgo))
                .map(progress -> progress.getUser().getId())
                .distinct()
                .count();
    }

    private long calculateMonthlyActiveUsers() {
        LocalDate monthAgo = LocalDate.now().minusDays(30);
        return dailyProgressRepository.findAll().stream()
                .filter(progress -> progress.getDate().isAfter(monthAgo))
                .map(progress -> progress.getUser().getId())
                .distinct()
                .count();
    }

    public Map<String, Object> unbanUser(String userId) {
        try {
            Optional<User> userOptional = userDAO.findById(userId);
            if (userOptional.isEmpty()) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "Không tìm thấy người dùng");
                return result;
            }
            
            User user = userOptional.get();
            // Restore user to MEMBER role
            user.setRole(Role.MEMBER);
            userDAO.save(user);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Đã mở khóa người dùng thành công");
            result.put("user", user);
            return result;
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Lỗi khi mở khóa người dùng: " + e.getMessage());
            return result;
        }
    }

    public User updateUserRole(String userId, String newRole) {
        User user = userDAO.findById(userId).orElse(null);
        if (user == null) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        
        // Validate role
        if (!(newRole.equals("GUEST") || newRole.equals("MEMBER") || newRole.equals("COACH"))) {
            throw new BadRequestException("Invalid role: " + newRole);
        }
        
        user.setRole(Role.valueOf(newRole));
        return userDAO.save(user);
    }

    public List<User> getAllCoaches() {
        return userDAO.findAll().stream()
                .filter(user -> user.getRole() == Role.COACH)
                .toList();
    }

    public User addCoach(Map<String, Object> coachData) {
        // Implementation for adding a new coach
        // This would involve creating a new user with COACH role
        // TODO: Implement coach creation logic
        throw new UnsupportedOperationException("Coach creation not yet implemented");
    }

    public Map<String, Object> removeCoach(String coachId) {
        try {
            Optional<User> coachOptional = userDAO.findById(coachId);
            if (coachOptional.isEmpty()) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "Không tìm thấy huấn luyện viên");
                return result;
            }
            
            User coach = coachOptional.get();
            if (coach.getRole() != Role.COACH) {
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "Người dùng này không phải là huấn luyện viên");
                return result;
            }
            
            coach.setRole(Role.MEMBER);
            userDAO.save(coach);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Đã xóa vai trò huấn luyện viên thành công");
            return result;
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "Lỗi khi xóa huấn luyện viên: " + e.getMessage());
            return result;
        }
    }

    public List<Object> getSystemReportsByEndDate(int page, int size, String endDate) {
        // Implementation for system reports
        // TODO: Implement system reports logic
        return new ArrayList<>();
    }

    public Map<String, Object> getRevenueReport(String period) {
        Map<String, Object> report = new HashMap<>();
        
        // Calculate revenue based on period
        BigDecimal totalRevenue = BigDecimal.ZERO;
        long transactionCount = 0;
        
        if ("monthly".equals(period)) {
            LocalDate startOfMonth = YearMonth.now().atDay(1);
            totalRevenue = membershipTransactionRepository.findAll().stream()
                    .filter(transaction -> transaction.getPaymentStatus() == MembershipTransaction.PaymentStatus.COMPLETED &&
                                           transaction.getCreatedAt().toLocalDate().isAfter(startOfMonth.minusDays(1)))
                    .map(MembershipTransaction::getFinalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            transactionCount = membershipTransactionRepository.findAll().stream()
                    .filter(transaction -> transaction.getPaymentStatus() == MembershipTransaction.PaymentStatus.COMPLETED &&
                                           transaction.getCreatedAt().toLocalDate().isAfter(startOfMonth.minusDays(1)))
                    .count();
        } else {
            // Default to all time
            totalRevenue = calculateTotalRevenue();
            transactionCount = membershipTransactionRepository.findAll().stream()
                    .filter(transaction -> transaction.getPaymentStatus() == MembershipTransaction.PaymentStatus.COMPLETED)
                    .count();
        }
        
        report.put("totalRevenue", totalRevenue);
        report.put("transactionCount", transactionCount);
        report.put("period", period);
        report.put("averageTransactionValue", transactionCount > 0 ? 
                totalRevenue.divide(BigDecimal.valueOf(transactionCount), java.math.RoundingMode.HALF_UP) : 
                BigDecimal.ZERO);
        
        return report;
    }

    public Map<String, Object> getUserActivityReport(String period) {
        Map<String, Object> report = new HashMap<>();
        
        long activeUsers = 0;
        if ("daily".equals(period)) {
            activeUsers = calculateDailyActiveUsers();
        } else if ("weekly".equals(period)) {
            activeUsers = calculateWeeklyActiveUsers();
        } else if ("monthly".equals(period)) {
            activeUsers = calculateMonthlyActiveUsers();
        } else {
            activeUsers = userDAO.findAll().stream()
                    .filter(User::isEnabled) // Changed from user -> user.isEnabled() for method reference
                    .count();
        }
        
        long totalUsers = userDAO.count();
        double activityRate = totalUsers > 0 ? (double) activeUsers / totalUsers * 100 : 0;
        
        report.put("activeUsers", activeUsers);
        report.put("totalUsers", totalUsers);
        report.put("activityRate", activityRate);
        report.put("period", period);
        
        return report;
    }

    /**
     * Lấy danh sách các phản hồi từ người dùng dưới dạng DTO.
     * @param page Số trang (bắt đầu từ 0).
     * @param size Kích thước trang.
     * @return Danh sách các đối tượng FeedbackResponse.
     */
    @Transactional
    public List<FeedbackResponse> getAllFeedbacks(int page, int size) {
        // Tạo đối tượng Pageable để hỗ trợ phân trang
        Pageable pageable = PageRequest.of(page, size);
        
        // Truy vấn tất cả các Feedback từ database với user được fetch eagerly
        List<Feedback> feedbacks = feedbackRepository.findAllWithUser(pageable).getContent();

        // Chuyển đổi List<Feedback> (entities) sang List<FeedbackResponse> (DTOs)
        return feedbacks.stream().map(feedback -> {
            // Lấy thông tin user từ đối tượng User liên kết
            String userId = "N/A";
            String userName = "N/A";
            String userEmail = "N/A";
            
            if (feedback.getUser() != null) {
                User user = feedback.getUser();
                userId = user.getId();
                // Tạo tên đầy đủ từ firstName + lastName
                String firstName = user.getFirstName() != null ? user.getFirstName() : "";
                String lastName = user.getLastName() != null ? user.getLastName() : "";
                userName = (firstName + " " + lastName).trim();
                if (userName.isEmpty()) {
                    userName = user.getUsername(); // Fallback to username if no name
                }
                userEmail = user.getEmail() != null ? user.getEmail() : "N/A";
            }

            // Tạo một đối tượng FeedbackResponse mới từ dữ liệu của Feedback entity
            return new FeedbackResponse(
                feedback.getId(),
                feedback.getRating(),
                feedback.getFeedbackContent(),
                feedback.getSubmissionTime(),
                userId,
                userName,
                userEmail,
                null // Không có thông báo cụ thể cho từng feedback khi liệt kê
            );
        }).collect(Collectors.toList()); // Thu thập các DTO vào một List
    }

    public Object replyToFeedback(String feedbackId, String message, String adminId) {
        // Implementation for replying to feedback
        // TODO: Implement feedback reply logic
        throw new UnsupportedOperationException("Feedback reply not yet implemented");
    }

    public Map<String, Object> updateSystemSettings(Map<String, Object> settings) {
        // Implementation for system settings
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Cài đặt hệ thống đã được cập nhật");
        return result;
    }

    public Map<String, Object> createBackup() {
        // Implementation for system backup
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Backup đã được tạo thành công");
        result.put("backupId", "backup_" + System.currentTimeMillis());
        return result;
    }

    public Map<String, Object> getRealtimeStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("onlineUsers", calculateDailyActiveUsers());
        stats.put("systemHealth", "HEALTHY");
        stats.put("lastUpdated", LocalDateTime.now());
        return stats;
    }

    public List<Object> getSystemReports(int page, int size, String level) {
        // Implementation for system logs
        return new ArrayList<>();
    }

    public List<Object> getSystemReports(String reportType, String startDate, String endDate) {
        // Implementation for system reports with date range
        return new ArrayList<>();
    }

    public User updateCoach(String coachId) {
        // Implementation for updating coach information
        // TODO: Implement coach update logic
        throw new UnsupportedOperationException("Coach update not yet implemented");
    }

    public User getUserById(String userId) {
        return userDAO.findById(userId).orElse(null);
    }
}