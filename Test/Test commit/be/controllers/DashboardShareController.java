package com.quitsmoking.controllers;

import com.quitsmoking.dto.response.DailyProgressResponse;
import com.quitsmoking.model.DashboardShare;
import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.DashboardShareRepository;
import com.quitsmoking.reponsitories.UserRepository;
import com.quitsmoking.services.DailyProgressService;
import com.quitsmoking.reponsitories.QuitPlanDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardShareController {

    @Autowired
    private DashboardShareRepository dashboardShareRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DailyProgressService dailyProgressService;

    @Autowired
    private QuitPlanDAO quitPlanDAO;

    @PostMapping("/share")
    public ResponseEntity<?> shareDashboard(@RequestBody ShareRequest request, Principal principal) {
        try {
            User member = userRepository.findByUsername(principal.getName()).orElse(null);
            User coach = userRepository.findById(request.getCoachId()).orElse(null);

            if (member == null || coach == null) {
                return ResponseEntity.badRequest().body("User not found");
            }

            // Kiểm tra xem đã chia sẻ chưa
            boolean alreadyShared = dashboardShareRepository.existsByMemberIdAndCoachId(member.getId(), coach.getId());
            if (alreadyShared) {
                return ResponseEntity.ok().body("Dashboard already shared with this coach");
            }

            DashboardShare share = new DashboardShare();
            share.setMemberId(member.getId());
            share.setCoachId(coach.getId());
            share.setSharedAt(LocalDateTime.now());

            dashboardShareRepository.save(share);
            System.out.println("Dashboard shared successfully: Member " + member.getUsername() + " -> Coach " + coach.getUsername());
            return ResponseEntity.ok().body("Dashboard shared successfully");
        } catch (Exception e) {
            System.err.println("Error sharing dashboard: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error sharing dashboard: " + e.getMessage());
        }
    }

    @GetMapping("/shared-coaches")
    public ResponseEntity<List<User>> getSharedCoaches(Principal principal) {
        try {
            User member = userRepository.findByUsername(principal.getName()).orElse(null);
            if (member == null) {
                return ResponseEntity.badRequest().build();
            }

            List<DashboardShare> shares = dashboardShareRepository.findByMemberId(member.getId());
            List<String> coachIds = shares.stream()
                    .map(DashboardShare::getCoachId)
                    .collect(Collectors.toList());
            
            List<User> coaches = userRepository.findAllById(coachIds);
            return ResponseEntity.ok(coaches);
        } catch (Exception e) {
            System.err.println("Error getting shared coaches: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/shared-members")
    @Transactional
    public ResponseEntity<List<SharedMemberResponse>> getSharedMembers(Principal principal) {
        try {
            User coach = userRepository.findByUsername(principal.getName()).orElse(null);
            if (coach == null) {
                return ResponseEntity.badRequest().build();
            }

            List<DashboardShare> shares = dashboardShareRepository.findByCoachId(coach.getId());
            List<String> memberIds = shares.stream()
                    .map(DashboardShare::getMemberId)
                    .collect(Collectors.toList());
            
            List<User> members = userRepository.findAllById(memberIds);
            List<SharedMemberResponse> responses = shares.stream()
                    .map(share -> {
                        User member = members.stream()
                                .filter(m -> m.getId().equals(share.getMemberId()))
                                .findFirst()
                                .orElse(null);
                        
                        if (member != null) {
                            return new SharedMemberResponse(
                                member.getId(),
                                member.getUsername(),
                                member.getEmail(),
                                member.getFirstName(),
                                member.getLastName(),
                                member.getPictureUrl(),
                                share.getSharedAt()
                            );
                        }
                        return null;
                    })
                    .filter(response -> response != null)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            System.err.println("Error getting shared members: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<?> getMemberDashboard(@PathVariable String memberId, Principal principal) {
        try {
            User currentUser = userRepository.findByUsername(principal.getName()).orElse(null);
            if (currentUser == null) {
                return ResponseEntity.badRequest().body("User not found");
            }

            // Kiểm tra quyền truy cập
            boolean hasPermission = false;
            
            // Nếu user là GUEST và đang xem dashboard của chính mình
            if (currentUser.getRole() == com.quitsmoking.model.Role.GUEST && currentUser.getId().equals(memberId)) {
                hasPermission = true;
            }
            // Nếu user là MEMBER và đang xem dashboard của chính mình
            else if (currentUser.getRole() == com.quitsmoking.model.Role.MEMBER && currentUser.getId().equals(memberId)) {
                hasPermission = true;
            }
            // Nếu user là COACH và member đã chia sẻ dashboard với coach này
            else if (currentUser.getRole() == com.quitsmoking.model.Role.COACH) {
                hasPermission = dashboardShareRepository.existsByMemberIdAndCoachId(memberId, currentUser.getId());
            }
            // Nếu user là ADMIN, cho phép xem tất cả
            else if (currentUser.getRole() == com.quitsmoking.model.Role.ADMIN) {
                hasPermission = true;
            }
            
            if (!hasPermission) {
                return ResponseEntity.status(403).body("Bạn không có quyền xem tiến độ này");
            }

            // Lấy thông tin member
            User member = userRepository.findById(memberId).orElse(null);
            if (member == null) {
                return ResponseEntity.notFound().build();
            }

            // Lấy QuitPlan hiện tại
            int defaultCigPerDay = 20;
            int cigPerDay = defaultCigPerDay;
            double pricePerCig = 1000.0;
            java.time.LocalDate quitDate = null;
            try {
                com.quitsmoking.model.QuitPlan plan = quitPlanDAO.findByUserAndActiveTrue(member).orElse(null);
                if (plan != null) {
                    String habit = plan.getInitialSmokingHabit();
                    if (habit != null && habit.matches("\\d+")) {
                        cigPerDay = Integer.parseInt(habit);
                    } else if (habit != null && habit.matches("\\d+.*")) {
                        cigPerDay = Integer.parseInt(habit.replaceAll("[^\\d]", ""));
                    }
                    if (plan.getPricePerPack() != null && plan.getPricePerPack() > 0) {
                        pricePerCig = plan.getPricePerPack() / 20.0;
                    }
                    if (plan.getStartDate() != null) {
                        quitDate = plan.getStartDate();
                    }
                }
            } catch (Exception ignore) {
                // Sử dụng giá trị mặc định nếu có lỗi
            }

            // Lấy toàn bộ progress
            List<com.quitsmoking.model.DailyProgress> allProgress = dailyProgressService.getUserProgress(member);
            int totalDays = allProgress.size();
            int smokeFreeDays = (int) allProgress.stream()
                .filter(dp -> dp != null && dp.getCigarettesSmoked() == 0)
                .count();
            
            int totalCigarettes = allProgress.stream()
                .filter(dp -> dp != null)
                .mapToInt(dp -> dp.getCigarettesSmoked())
                .sum();
                
            int avoidedCigarettes = cigPerDay * totalDays - totalCigarettes;
            if (avoidedCigarettes < 0) avoidedCigarettes = 0;
            double moneySaved = avoidedCigarettes * pricePerCig;

            // Cảm giác hôm nay
            java.time.LocalDate today = java.time.LocalDate.now();
            Integer todayMood = allProgress.stream()
                .filter(dp -> dp != null && dp.getDate() != null && today.equals(dp.getDate()))
                .map(com.quitsmoking.model.DailyProgress::getMoodRating)
                .filter(mood -> mood != null)
                .findFirst()
                .orElse(null);

            // Lấy tiến độ tuần hiện tại
            java.time.DayOfWeek dow = today.getDayOfWeek();
            int daysFromMonday = (dow.getValue() + 6) % 7; // Monday=0, Sunday=6
            java.time.LocalDate monday = today.minusDays(daysFromMonday);
            java.time.LocalDate sunday = monday.plusDays(6);
            
            List<com.quitsmoking.model.DailyProgress> progressList = dailyProgressService.getProgressInDateRange(member, monday, sunday);
            Map<java.time.LocalDate, com.quitsmoking.model.DailyProgress> progressMap = progressList.stream()
                .filter(dp -> dp != null && dp.getDate() != null)
                .collect(Collectors.toMap(
                    com.quitsmoking.model.DailyProgress::getDate, 
                    dp -> dp,
                    (existing, replacement) -> existing
                ));
                
            List<DailyProgressResponse> weekData = new java.util.ArrayList<>();
            for (int i = 0; i < 7; i++) {
                java.time.LocalDate date = monday.plusDays(i);
                com.quitsmoking.model.DailyProgress dp = progressMap.get(date);
                weekData.add(dp != null ? DailyProgressResponse.fromEntity(dp) : null);
            }

            // Thống kê đã được tính toán ở trên (smokeFreeDays, moneySaved, avoidedCigarettes, todayMood)
            
            Map<String, Object> response = new HashMap<>();
            
            Map<String, Object> memberInfo = new HashMap<>();
            memberInfo.put("id", member.getId());
            memberInfo.put("username", member.getUsername());
            memberInfo.put("email", member.getEmail());
            memberInfo.put("firstName", member.getFirstName());
            memberInfo.put("lastName", member.getLastName());
            memberInfo.put("quitDate", quitDate != null ? quitDate.toString() : null);
            response.put("member", memberInfo);
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("smokeFreeDays", smokeFreeDays);
            summary.put("moneySaved", Math.round(moneySaved * 100.0) / 100.0);
            summary.put("avoidedCigarettes", avoidedCigarettes);
            summary.put("todayMood", todayMood);
            response.put("summary", summary);
            
            // Đồng bộ statistics với summary để member và coach đều xem cùng số liệu
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("smokeFreeDays", smokeFreeDays);
            statistics.put("moneySaved", Math.round(moneySaved * 100.0) / 100.0);
            statistics.put("avoidedCigarettes", avoidedCigarettes);
            statistics.put("todayMood", todayMood);
            response.put("statistics", statistics);
            
            Map<String, Object> weeklyProgress = new HashMap<>();
            weeklyProgress.put("startDate", monday);
            weeklyProgress.put("endDate", sunday);
            weeklyProgress.put("dailyData", weekData);
            response.put("weeklyProgress", weeklyProgress);
            
            System.out.println("Dashboard accessed: User " + currentUser.getUsername() + " viewing member " + member.getUsername() + " dashboard");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log lỗi để debug
            System.err.println("Error in getMemberDashboard: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    public static class ShareRequest {
        private String coachId;

        public String getCoachId() {
            return coachId;
        }

        public void setCoachId(String coachId) {
            this.coachId = coachId;
        }
    }

    public static class SharedMemberResponse {
        private String id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String pictureUrl;
        private LocalDateTime sharedAt;

        public SharedMemberResponse(String id, String username, String email, String firstName, String lastName, String pictureUrl, LocalDateTime sharedAt) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.pictureUrl = pictureUrl;
            this.sharedAt = sharedAt;
        }

        // Getters
        public String getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getPictureUrl() { return pictureUrl; }
        public LocalDateTime getSharedAt() { return sharedAt; }
    }
}