package com.quitsmoking.services;
import com.quitsmoking.model.User;
import com.quitsmoking.model.UserSettings;
import com.quitsmoking.reponsitories.UserRepository;
import com.quitsmoking.reponsitories.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalTime;
import java.util.Map;
import java.util.Optional;
/**
 * Service quản lý cài đặt người dùng
 */
@Service
@Transactional
public class UserSettingsService {
    @Autowired
    private UserSettingsRepository userSettingsRepository;
    @Autowired
    private UserRepository userRepository;
    /**
     * Lấy cài đặt của người dùng (tạo mới nếu chưa có)
     */
    public UserSettings getUserSettings(String userId) {
        Optional<UserSettings> settings = userSettingsRepository.findByUserId(userId);
        
        if (settings.isPresent()) {
            return settings.get();
        }
        
        // Tạo cài đặt mặc định nếu chưa có
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        
        UserSettings defaultSettings = new UserSettings(user);
        return userSettingsRepository.save(defaultSettings);
    }
    /**
     * Cập nhật toàn bộ cài đặt người dùng
     */
    public UserSettings updateUserSettings(String userId, UserSettings settingsRequest) {
        UserSettings existingSettings = getUserSettings(userId);
        
        // Cập nhật các trường từ request
        if (settingsRequest.getDailyReminder() != null) {
            existingSettings.setDailyReminder(settingsRequest.getDailyReminder());
        }
        if (settingsRequest.getWeeklyReport() != null) {
            existingSettings.setWeeklyReport(settingsRequest.getWeeklyReport());
        }
        if (settingsRequest.getAchievementAlert() != null) {
            existingSettings.setAchievementAlert(settingsRequest.getAchievementAlert());
        }
        if (settingsRequest.getMotivationalMessage() != null) {
            existingSettings.setMotivationalMessage(settingsRequest.getMotivationalMessage());
        }
        if (settingsRequest.getReminderTime() != null) {
            existingSettings.setReminderTime(settingsRequest.getReminderTime());
        }
        if (settingsRequest.getProfileVisibility() != null) {
            existingSettings.setProfileVisibility(settingsRequest.getProfileVisibility());
        }
        if (settingsRequest.getShareAchievements() != null) {
            existingSettings.setShareAchievements(settingsRequest.getShareAchievements());
        }
        if (settingsRequest.getAllowCoachContact() != null) {
            existingSettings.setAllowCoachContact(settingsRequest.getAllowCoachContact());
        }
        if (settingsRequest.getLanguage() != null) {
            existingSettings.setLanguage(settingsRequest.getLanguage());
        }
        if (settingsRequest.getTheme() != null) {
            existingSettings.setTheme(settingsRequest.getTheme());
        }
        if (settingsRequest.getCurrency() != null) {
            existingSettings.setCurrency(settingsRequest.getCurrency());
        }
        if (settingsRequest.getDateFormat() != null) {
            existingSettings.setDateFormat(settingsRequest.getDateFormat());
        }
        
        return userSettingsRepository.save(existingSettings);
    }
    /**
     * Cập nhật cài đặt thông báo
     */
    public UserSettings updateNotificationSettings(String userId, Map<String, Object> notificationSettings) {
        UserSettings settings = getUserSettings(userId);
        
        if (notificationSettings.containsKey("dailyReminder")) {
            settings.setDailyReminder((Boolean) notificationSettings.get("dailyReminder"));
        }
        if (notificationSettings.containsKey("weeklyReport")) {
            settings.setWeeklyReport((Boolean) notificationSettings.get("weeklyReport"));
        }
        if (notificationSettings.containsKey("achievementAlert")) {
            settings.setAchievementAlert((Boolean) notificationSettings.get("achievementAlert"));
        }
        if (notificationSettings.containsKey("motivationalMessage")) {
            settings.setMotivationalMessage((Boolean) notificationSettings.get("motivationalMessage"));
        }
        if (notificationSettings.containsKey("reminderTime")) {
            String timeStr = (String) notificationSettings.get("reminderTime");
            settings.setReminderTime(LocalTime.parse(timeStr));
        }
        
        return userSettingsRepository.save(settings);
    }
    /**
     * Cập nhật cài đặt quyền riêng tư
     */
    public UserSettings updatePrivacySettings(String userId, Map<String, Object> privacySettings) {
        UserSettings settings = getUserSettings(userId);
        
        if (privacySettings.containsKey("profileVisibility")) {
            String visibility = (String) privacySettings.get("profileVisibility");
            settings.setProfileVisibility(UserSettings.ProfileVisibility.valueOf(visibility));
        }
        if (privacySettings.containsKey("shareAchievements")) {
            settings.setShareAchievements((Boolean) privacySettings.get("shareAchievements"));
        }
        if (privacySettings.containsKey("allowCoachContact")) {
            settings.setAllowCoachContact((Boolean) privacySettings.get("allowCoachContact"));
        }
        
        return userSettingsRepository.save(settings);
    }
    /**
     * Cập nhật tùy chọn cá nhân
     */
    public UserSettings updatePreferences(String userId, Map<String, Object> preferences) {
        UserSettings settings = getUserSettings(userId);
        
        if (preferences.containsKey("language")) {
            settings.setLanguage((String) preferences.get("language"));
        }
        if (preferences.containsKey("theme")) {
            String theme = (String) preferences.get("theme");
            settings.setTheme(UserSettings.Theme.valueOf(theme.toUpperCase()));
        }
        if (preferences.containsKey("currency")) {
            settings.setCurrency((String) preferences.get("currency"));
        }
        if (preferences.containsKey("dateFormat")) {
            settings.setDateFormat((String) preferences.get("dateFormat"));
        }
        
        return userSettingsRepository.save(settings);
    }
    /**
     * Reset cài đặt về mặc định
     */
    public UserSettings resetToDefault(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        
        // Xóa cài đặt hiện tại
        userSettingsRepository.deleteByUserId(userId);
        
        // Tạo cài đặt mặc định mới
        UserSettings defaultSettings = new UserSettings(user);
        return userSettingsRepository.save(defaultSettings);
    }
    /**
     * Xóa cài đặt người dùng (khi xóa tài khoản)
     */
    public void deleteUserSettings(String userId) {
        userSettingsRepository.deleteByUserId(userId);
    }
}