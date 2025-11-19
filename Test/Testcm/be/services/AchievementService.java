package com.quitsmoking.services;
import com.quitsmoking.model.Achievement;
import com.quitsmoking.model.User;
import com.quitsmoking.model.UserAchievement;
import com.quitsmoking.reponsitories.AchievementRepository;
import com.quitsmoking.reponsitories.DailyProgressRepository;
import com.quitsmoking.reponsitories.UserAchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
@Service
@Transactional
public class AchievementService {
    @Autowired
    private AchievementRepository achievementRepository;
    @Autowired
    private UserAchievementRepository userAchievementRepository;
    @Autowired
    private DailyProgressRepository dailyProgressRepository;
    @Autowired
    private NotificationService notificationService;
    public List<Achievement> getAllAchievements() {
        return achievementRepository.findAll();
    }
    public List<UserAchievement> getUserAchievements(User user) {
        return userAchievementRepository.findByUserOrderByEarnedDateDesc(user);
    }
    public void checkAndAwardAchievements(User user) {
        try {
            // Kiểm tra achievements cho số ngày không hút thuốc
            checkSmokeFreeDaysAchievements(user);
            
            // Kiểm tra achievements cho tiền tiết kiệm
            checkMoneySavedAchievements(user);
            
            // Kiểm tra achievements cho số điếu tránh được
            checkCigarettesAvoidedAchievements(user);
        } catch (Exception e) {
            // Log error but don't throw to avoid breaking the main flow
            System.err.println("Error checking achievements for user " + user.getId() + ": " + e.getMessage());
        }
    }
    private void checkSmokeFreeDaysAchievements(User user) {
        Long smokeFreeDays = dailyProgressRepository.getSmokeFreeDays(user);
        if (smokeFreeDays == null) smokeFreeDays = 0L;
        List<Achievement> dayAchievements = achievementRepository
            .findByCriteriaTypeAndCriteriaValueLessThanEqual(
                Achievement.CriteriaType.DAYS_SMOKE_FREE, smokeFreeDays.intValue());
        for (Achievement achievement : dayAchievements) {
            awardAchievementIfNotEarned(user, achievement);
        }
    }
    private void checkMoneySavedAchievements(User user) {
        Double totalMoneySaved = dailyProgressRepository.getTotalMoneySaved(user);
        if (totalMoneySaved == null) totalMoneySaved = 0.0;
        List<Achievement> moneyAchievements = achievementRepository
            .findByCriteriaTypeAndCriteriaValueLessThanEqual(
                Achievement.CriteriaType.MONEY_SAVED, totalMoneySaved.intValue());
        for (Achievement achievement : moneyAchievements) {
            awardAchievementIfNotEarned(user, achievement);
        }
    }
    private void checkCigarettesAvoidedAchievements(User user) {
        // Tính số điếu tránh được = (số ngày không hút * 20) - tổng số điếu đã hút
        Long smokeFreeDays = dailyProgressRepository.getSmokeFreeDays(user);
        Long totalSmoked = dailyProgressRepository.getTotalCigarettesSmoked(user);
        
        if (smokeFreeDays == null) smokeFreeDays = 0L;
        if (totalSmoked == null) totalSmoked = 0L;
        
        long cigarettesAvoided = (smokeFreeDays * 20) - totalSmoked;
        if (cigarettesAvoided < 0) cigarettesAvoided = 0;
        List<Achievement> cigaretteAchievements = achievementRepository
            .findByCriteriaTypeAndCriteriaValueLessThanEqual(
                Achievement.CriteriaType.CIGARETTES_AVOIDED, (int) cigarettesAvoided);
        for (Achievement achievement : cigaretteAchievements) {
            awardAchievementIfNotEarned(user, achievement);
        }
    }
    private void awardAchievementIfNotEarned(User user, Achievement achievement) {
        if (!userAchievementRepository.existsByUserAndAchievement(user, achievement)) {
            UserAchievement userAchievement = new UserAchievement(user, achievement);
            userAchievementRepository.save(userAchievement);
            
            // Gửi thông báo về achievement mới
            notificationService.sendAchievementNotification(user, achievement);
        }
    }
    public UserAchievement shareAchievement(User user, String achievementId) {
        Achievement achievement = achievementRepository.findById(achievementId)
            .orElseThrow(() -> new RuntimeException("Achievement not found"));
        
        UserAchievement userAchievement = userAchievementRepository
            .findByUserAndAchievement(user, achievement)
            .orElseThrow(() -> new RuntimeException("User has not earned this achievement"));
        
        userAchievement.setShared(true);
        return userAchievementRepository.save(userAchievement);
    }

    public UserAchievement unlockAchievement(User user, String achievementId) {
        System.out.println("DEBUG: Attempting to unlock achievement: " + achievementId + " for user: " + user.getUsername());
        
        Achievement achievement = achievementRepository.findById(achievementId)
            .orElseThrow(() -> {
                System.err.println("DEBUG: Achievement not found with ID: " + achievementId);
                return new RuntimeException("Achievement not found with ID: " + achievementId);
            });
        
        System.out.println("DEBUG: Found achievement: " + achievement.getName() + " (ID: " + achievement.getId() + ")");
        
        // Kiểm tra xem user đã có achievement này chưa
        if (userAchievementRepository.existsByUserAndAchievement(user, achievement)) {
            System.err.println("DEBUG: User already has this achievement");
            throw new RuntimeException("User has already earned this achievement");
        }
        
        // Kiểm tra xem user có đủ điều kiện để unlock không
        boolean isEligible = isUserEligibleForAchievement(user, achievement);
        System.out.println("DEBUG: User eligibility check result: " + isEligible);
        
        if (!isEligible) {
            System.err.println("DEBUG: User does not meet criteria for achievement: " + achievement.getName());
            throw new RuntimeException("User does not meet the criteria for this achievement");
        }
        
        // Tạo UserAchievement mới
        UserAchievement userAchievement = new UserAchievement(user, achievement);
        userAchievement = userAchievementRepository.save(userAchievement);
        
        System.out.println("DEBUG: Successfully unlocked achievement: " + achievement.getName());
        
        // Gửi thông báo về achievement mới
        notificationService.sendAchievementNotification(user, achievement);
        
        return userAchievement;
    }

    private boolean isUserEligibleForAchievement(User user, Achievement achievement) {
        switch (achievement.getCriteriaType()) {
            case DAYS_SMOKE_FREE:
                Long smokeFreeDays = getSmokeFreeDays(user);
                return smokeFreeDays != null && smokeFreeDays >= achievement.getCriteriaValue();
            case MONEY_SAVED:
                Double moneySaved = getMoneySaved(user);
                return moneySaved != null && moneySaved >= achievement.getCriteriaValue();
            case CIGARETTES_AVOIDED:
                Long cigarettesAvoided = getCigarettesAvoided(user);
                return cigarettesAvoided != null && cigarettesAvoided >= achievement.getCriteriaValue();
            default:
                return false;
        }
    }
    public List<UserAchievement> getSharedAchievements() {
        return userAchievementRepository.findByIsSharedTrueOrderByEarnedDateDesc();
    }
    public Long getUserAchievementCount(User user) {
        return userAchievementRepository.countByUser(user);
    }
    public List<UserAchievement> getUserSharedAchievements(User user) {
        return userAchievementRepository.findSharedAchievementsByUser(user);
    }

    // Helper methods for getting user stats
    public Long getSmokeFreeDays(User user) {
        return dailyProgressRepository.getSmokeFreeDays(user);
    }

    public Double getMoneySaved(User user) {
        return dailyProgressRepository.getTotalMoneySaved(user);
    }

    public Long getCigarettesAvoided(User user) {
        Long smokeFreeDays = dailyProgressRepository.getSmokeFreeDays(user);
        Long totalSmoked = dailyProgressRepository.getTotalCigarettesSmoked(user);
        
        if (smokeFreeDays == null) smokeFreeDays = 0L;
        if (totalSmoked == null) totalSmoked = 0L;
        
        long cigarettesAvoided = (smokeFreeDays * 20) - totalSmoked;
        return Math.max(cigarettesAvoided, 0);
    }
    // Tạo achievement mới (dành cho admin)
    public Achievement createAchievement(String name, String description, 
                                       Achievement.CriteriaType criteriaType, 
                                       int criteriaValue, String badgeColor) {
        Achievement achievement = new Achievement(name, description, criteriaType, criteriaValue);
        achievement.setBadgeColor(badgeColor);
        return achievementRepository.save(achievement);
    }
}