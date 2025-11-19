package com.quitsmoking.services;
import com.quitsmoking.model.DailyProgress;
import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.DailyProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
@Service
public class DailyProgressService {
    @Autowired
    private DailyProgressRepository dailyProgressRepository;
    @Autowired
    private AchievementService achievementService;
    public DailyProgress saveProgress(DailyProgress progress) {
        DailyProgress saved = dailyProgressRepository.save(progress);
        
        // Kiểm tra achievements sau khi lưu progress
        achievementService.checkAndAwardAchievements(progress.getUser());
        
        return saved;
    }
    public Optional<DailyProgress> getProgressByDate(User user, LocalDate date) {
        return dailyProgressRepository.findByUserAndDate(user, date);
    }
    public List<DailyProgress> getUserProgress(User user) {
        return dailyProgressRepository.findByUserOrderByDateDesc(user);
    }
    public List<DailyProgress> getProgressInDateRange(User user, LocalDate startDate, LocalDate endDate) {
        return dailyProgressRepository.findByUserAndDateBetweenOrderByDate(user, startDate, endDate);
    }
    public Long getSmokeFreeeDays(User user) {
        return dailyProgressRepository.getSmokeFreeDays(user);
    }
    public Double getTotalMoneySaved(User user) {
        Double total = dailyProgressRepository.getTotalMoneySaved(user);
        return total != null ? total : 0.0;
    }
    public Long getTotalCigarettesSmoked(User user) {
        Long total = dailyProgressRepository.getTotalCigarettesSmoked(user);
        return total != null ? total : 0L;
    }
    public DailyProgress createOrUpdateTodayProgress(User user, int cigarettesSmoked, int moodRating, 
                                                   int stressLevel, int cravingsIntensity, String notes) {
        LocalDate today = LocalDate.now();
        Optional<DailyProgress> existingProgress = getProgressByDate(user, today);
        
        DailyProgress progress;
        if (existingProgress.isPresent()) {
            progress = existingProgress.get();
        } else {
            progress = new DailyProgress(user, today);
        }
        
        progress.setCigarettesSmoked(cigarettesSmoked);
        progress.setMoodRating(moodRating);
        progress.setStressLevel(stressLevel);
        progress.setCravingsIntensity(cravingsIntensity);
        progress.setNote(notes);
        
        // Tính toán tiền tiết kiệm (giả sử mỗi điếu giá 1000 VND)
        BigDecimal costPerCigarette = new BigDecimal("1000");
        BigDecimal potentialSpent = costPerCigarette.multiply(new BigDecimal(cigarettesSmoked));
        BigDecimal dailySavings = costPerCigarette.multiply(new BigDecimal(20)).subtract(potentialSpent); // Giả sử hút 20 điếu/ngày
        if (dailySavings.compareTo(BigDecimal.ZERO) > 0) {
            progress.setMoneySaved(dailySavings);
        }
        
        return saveProgress(progress);
    }
    public List<DailyProgress> getRecentProgress(User user, int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        return dailyProgressRepository.findRecentProgress(user, startDate);
    }
    // Thống kê tổng quan
    public ProgressStatistics getProgressStatistics(User user) {
        Long smokeFreeeDays = getSmokeFreeeDays(user);
        Double totalMoneySaved = getTotalMoneySaved(user);
        Long totalCigarettesSmoked = getTotalCigarettesSmoked(user);
        
        // Tính toán streak hiện tại (số ngày liên tiếp không hút)
        int currentStreak = calculateCurrentStreak(user);
        
        return new ProgressStatistics(smokeFreeeDays, totalMoneySaved, 
                                    totalCigarettesSmoked, currentStreak);
    }
    private int calculateCurrentStreak(User user) {
        List<DailyProgress> recentProgress = getRecentProgress(user, 365); // Lấy 1 năm gần nhất
        int streak = 0;
        
        for (DailyProgress progress : recentProgress) {
            // Kiểm tra cả cigarettesSmoked và smokedToday
            boolean isSmokeFree = progress.getCigarettesSmoked() == 0 || 
                                 (progress.getSmokedToday() != null && !progress.getSmokedToday());
            
            if (isSmokeFree) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
    // Lớp inner để trả về thống kê
    public static class ProgressStatistics {
        private final Long smokeFreeeDays;
        private final Double totalMoneySaved;
        private final Long totalCigarettesSmoked;
        private final int currentStreak;
        public ProgressStatistics(Long smokeFreeeDays, Double totalMoneySaved, 
                                Long totalCigarettesSmoked, int currentStreak) {
            this.smokeFreeeDays = smokeFreeeDays;
            this.totalMoneySaved = totalMoneySaved;
            this.totalCigarettesSmoked = totalCigarettesSmoked;
            this.currentStreak = currentStreak;
        }
        // Getters
        public Long getSmokeFreeeDays() { return smokeFreeeDays; }
        public Double getTotalMoneySaved() { return totalMoneySaved; }
        public Long getTotalCigarettesSmoked() { return totalCigarettesSmoked; }
        public int getCurrentStreak() { return currentStreak; }
    }
    public DailyProgress createOrUpdateProgress(User user, com.quitsmoking.dto.request.DailyProgressRequest req) {
        java.time.LocalDate date = req.getDate() != null ? req.getDate() : java.time.LocalDate.now();
        Optional<DailyProgress> existing = getProgressByDate(user, date);
        DailyProgress progress = existing.orElse(new DailyProgress(user, date));

        progress.setMoodRating(req.getMood() != null ? req.getMood() : 0);
        progress.setCravingsIntensity(req.getCravings() != null ? req.getCravings() : 0);
        progress.setExercise(req.getExercise());
        progress.setWater(req.getWater());
        progress.setSleep(req.getSleep());
        progress.setNote(req.getNote());
        progress.setSmokedToday(req.getSmokedToday());
        progress.setCigarettesToday(req.getCigarettesToday());
        progress.setMoneySpentToday(req.getMoneySpentToday());

        // Đồng bộ cigarettesSmoked với smokedToday và cigarettesToday
        if (req.getSmokedToday() != null && req.getSmokedToday()) {
            // Nếu có hút thuốc hôm nay
            if (req.getCigarettesToday() != null) {
                progress.setCigarettesSmoked(req.getCigarettesToday());
            } else {
                progress.setCigarettesSmoked(1); // Mặc định 1 điếu nếu không có số cụ thể
            }
        } else {
            // Nếu không hút thuốc hôm nay
            progress.setCigarettesSmoked(0);
        }

        // Có thể thêm logic tính moneySaved, healthImprovements nếu cần
        return saveProgress(progress);
    }
}