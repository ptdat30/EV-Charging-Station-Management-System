package com.quitsmoking.controllers;
import com.quitsmoking.model.User;
import com.quitsmoking.model.UserSettings;
import com.quitsmoking.services.UserSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.Map;
/**
 * Controller quản lý cài đặt người dùng
 */
@RestController
@RequestMapping("/api/users/settings")
@CrossOrigin(origins = "*")
public class SettingsController {
    @Autowired
    private UserSettingsService userSettingsService;
    /**
     * Lấy cài đặt hiện tại của người dùng
     */
    @GetMapping
    public ResponseEntity<UserSettings> getUserSettings(@AuthenticationPrincipal User user) {
        UserSettings settings = userSettingsService.getUserSettings(user.getId());
        return ResponseEntity.ok(settings);
    }
    /**
     * Cập nhật cài đặt người dùng
     */
    @PutMapping
    public ResponseEntity<UserSettings> updateUserSettings(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserSettings settingsRequest) {
        
        UserSettings updatedSettings = userSettingsService.updateUserSettings(user.getId(), settingsRequest);
        return ResponseEntity.ok(updatedSettings);
    }
    /**
     * Cập nhật cài đặt thông báo
     */
    @PutMapping("/notifications")
    public ResponseEntity<UserSettings> updateNotificationSettings(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> notificationSettings) {
        
        UserSettings settings = userSettingsService.updateNotificationSettings(user.getId(), notificationSettings);
        return ResponseEntity.ok(settings);
    }
    /**
     * Cập nhật cài đặt quyền riêng tư
     */
    @PutMapping("/privacy")
    public ResponseEntity<UserSettings> updatePrivacySettings(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> privacySettings) {
        
        UserSettings settings = userSettingsService.updatePrivacySettings(user.getId(), privacySettings);
        return ResponseEntity.ok(settings);
    }
    /**
     * Cập nhật tùy chọn cá nhân
     */
    @PutMapping("/preferences")
    public ResponseEntity<UserSettings> updatePreferences(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> preferences) {
        
        UserSettings settings = userSettingsService.updatePreferences(user.getId(), preferences);
        return ResponseEntity.ok(settings);
    }
    /**
     * Reset cài đặt về mặc định
     */
    @PostMapping("/reset")
    public ResponseEntity<UserSettings> resetToDefault(@AuthenticationPrincipal User user) {
        UserSettings settings = userSettingsService.resetToDefault(user.getId());
        return ResponseEntity.ok(settings);
    }
}