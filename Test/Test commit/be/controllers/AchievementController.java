package com.quitsmoking.controllers;
import com.quitsmoking.model.Achievement;
import com.quitsmoking.model.User;
import com.quitsmoking.model.UserAchievement;
import com.quitsmoking.services.AchievementService;
import com.quitsmoking.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/achievements")
@CrossOrigin(origins = "http://localhost:3000")
public class AchievementController {
    @Autowired
    private AchievementService achievementService;
    @Autowired
    private UserService userService;
    
    @GetMapping("/all")
    public ResponseEntity<?> getAllAchievements() {
        try {
            List<Achievement> achievements = achievementService.getAllAchievements();
            return ResponseEntity.ok(achievements);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    
    @GetMapping("/my")
    public ResponseEntity<?> getMyAchievements(Authentication authentication) {
        try {
            System.out.println("DEBUG: getMyAchievements called for user: " + authentication.getName());
            
            User user = userService.findByUsername(authentication.getName());
            System.out.println("DEBUG: Found user: " + user.getId());
            
            List<UserAchievement> userAchievements = achievementService.getUserAchievements(user);
            System.out.println("DEBUG: Found " + userAchievements.size() + " achievements");
            
            // Convert to DTO to avoid serialization issues
            List<Map<String, Object>> achievementDtos = userAchievements.stream()
                .map(ua -> {
                    try {
                        Map<String, Object> dto = new HashMap<>();
                        dto.put("id", ua.getId());
                        dto.put("achievementId", ua.getAchievement().getId());
                        dto.put("achievementName", ua.getAchievement().getName());
                        dto.put("achievementDescription", ua.getAchievement().getDescription());
                        dto.put("achievementIconUrl", ua.getAchievement().getIconUrl());
                        dto.put("achievementBadgeColor", ua.getAchievement().getBadgeColor());
                        dto.put("achievementCriteriaType", ua.getAchievement().getCriteriaType());
                        dto.put("achievementCriteriaValue", ua.getAchievement().getCriteriaValue());
                        dto.put("earnedDate", ua.getEarnedDate());
                        dto.put("isShared", ua.isShared());
                        return dto;
                    } catch (Exception e) {
                        System.err.println("DEBUG: Error mapping achievement: " + e.getMessage());
                        throw e;
                    }
                })
                .collect(Collectors.toList());
            
            System.out.println("DEBUG: Successfully converted to DTOs");
            return ResponseEntity.ok(achievementDtos);
        } catch (Exception e) {
            System.err.println("DEBUG: Error in getMyAchievements: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    
    @PostMapping("/share/{achievementId}")
    public ResponseEntity<?> shareAchievement(
            @PathVariable String achievementId,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            UserAchievement sharedAchievement = achievementService.shareAchievement(user, achievementId);
            
            // Return DTO
            Map<String, Object> achievementDto = new HashMap<>();
            achievementDto.put("id", sharedAchievement.getId());
            achievementDto.put("achievementId", sharedAchievement.getAchievement().getId());
            achievementDto.put("achievementName", sharedAchievement.getAchievement().getName());
            achievementDto.put("earnedDate", sharedAchievement.getEarnedDate());
            achievementDto.put("isShared", sharedAchievement.isShared());
            
            return ResponseEntity.ok(achievementDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    
    @GetMapping("/shared")
    public ResponseEntity<?> getSharedAchievements() {
        try {
            List<UserAchievement> sharedAchievements = achievementService.getSharedAchievements();
            
            // Convert to DTO
            List<Map<String, Object>> achievementDtos = sharedAchievements.stream()
                .map(ua -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", ua.getId());
                    dto.put("achievementId", ua.getAchievement().getId());
                    dto.put("achievementName", ua.getAchievement().getName());
                    dto.put("achievementDescription", ua.getAchievement().getDescription());
                    dto.put("achievementIconUrl", ua.getAchievement().getIconUrl());
                    dto.put("achievementBadgeColor", ua.getAchievement().getBadgeColor());
                    dto.put("earnedDate", ua.getEarnedDate());
                    dto.put("isShared", ua.isShared());
                    return dto;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(achievementDtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    
    @GetMapping("/my/shared")
    public ResponseEntity<?> getMySharedAchievements(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            List<UserAchievement> mySharedAchievements = achievementService.getUserSharedAchievements(user);
            
            // Convert to DTO
            List<Map<String, Object>> achievementDtos = mySharedAchievements.stream()
                .map(ua -> {
                    Map<String, Object> dto = new HashMap<>();
                    dto.put("id", ua.getId());
                    dto.put("achievementId", ua.getAchievement().getId());
                    dto.put("achievementName", ua.getAchievement().getName());
                    dto.put("achievementDescription", ua.getAchievement().getDescription());
                    dto.put("achievementIconUrl", ua.getAchievement().getIconUrl());
                    dto.put("achievementBadgeColor", ua.getAchievement().getBadgeColor());
                    dto.put("earnedDate", ua.getEarnedDate());
                    dto.put("isShared", ua.isShared());
                    return dto;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(achievementDtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    
    @GetMapping("/count")
    public ResponseEntity<?> getMyAchievementCount(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            Long count = achievementService.getUserAchievementCount(user);
            return ResponseEntity.ok().body("{\"count\": " + count + "}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    
    @PostMapping("/check")
    public ResponseEntity<?> checkAchievements(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            achievementService.checkAndAwardAchievements(user);
            return ResponseEntity.ok().body("Đã kiểm tra achievements");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/{achievementId}/unlock")
    public ResponseEntity<?> unlockAchievement(
            @PathVariable String achievementId,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            UserAchievement unlockedAchievement = achievementService.unlockAchievement(user, achievementId);
            
            // Return DTO
            Map<String, Object> achievementDto = new HashMap<>();
            achievementDto.put("id", unlockedAchievement.getId());
            achievementDto.put("achievementId", unlockedAchievement.getAchievement().getId());
            achievementDto.put("achievementName", unlockedAchievement.getAchievement().getName());
            achievementDto.put("achievementDescription", unlockedAchievement.getAchievement().getDescription());
            achievementDto.put("achievementIconUrl", unlockedAchievement.getAchievement().getIconUrl());
            achievementDto.put("achievementBadgeColor", unlockedAchievement.getAchievement().getBadgeColor());
            achievementDto.put("earnedDate", unlockedAchievement.getEarnedDate());
            achievementDto.put("isShared", unlockedAchievement.isShared());
            
            return ResponseEntity.ok(achievementDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            
            // Get user stats for achievements
            Long smokeFreeDays = achievementService.getSmokeFreeDays(user);
            Double moneySaved = achievementService.getMoneySaved(user);
            Long cigarettesAvoided = achievementService.getCigarettesAvoided(user);
            Long totalAchievements = achievementService.getUserAchievementCount(user);
            
            return ResponseEntity.ok(Map.of(
                "daysSmokeFreeDays", smokeFreeDays != null ? smokeFreeDays : 0,
                "moneySaved", moneySaved != null ? moneySaved : 0.0,
                "cigarettesAvoided", cigarettesAvoided != null ? cigarettesAvoided : 0,
                "totalAchievements", totalAchievements != null ? totalAchievements : 0
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    
    // Admin endpoints
    @PostMapping("/create")
    public ResponseEntity<?> createAchievement(
            @RequestBody CreateAchievementRequest request,
            Authentication authentication) {
        try {
            // Kiểm tra quyền admin (có thể implement sau)
            Achievement achievement = achievementService.createAchievement(
                request.getName(),
                request.getDescription(),
                request.getCriteriaType(),
                request.getCriteriaValue(),
                request.getBadgeColor()
            );
            return ResponseEntity.ok(achievement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    
    // DTO class cho tạo achievement
    public static class CreateAchievementRequest {
        private String name;
        private String description;
        private Achievement.CriteriaType criteriaType;
        private int criteriaValue;
        private String badgeColor;
        
        // Constructors
        public CreateAchievementRequest() {}
        
        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Achievement.CriteriaType getCriteriaType() { return criteriaType; }
        public void setCriteriaType(Achievement.CriteriaType criteriaType) { this.criteriaType = criteriaType; }
        public int getCriteriaValue() { return criteriaValue; }
        public void setCriteriaValue(int criteriaValue) { this.criteriaValue = criteriaValue; }
        public String getBadgeColor() { return badgeColor; }
        public void setBadgeColor(String badgeColor) { this.badgeColor = badgeColor; }
    }
}