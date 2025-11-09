package com.notificationservice.services;

import java.util.List;

public interface FcmTokenService {
    
    /**
     * Register a new FCM token for a user
     */
    void registerToken(Long userId, String token, String deviceType, String deviceId);
    
    /**
     * Get all active tokens for a user
     */
    List<String> getActiveTokensForUser(Long userId);
    
    /**
     * Deactivate a token (e.g., when user logs out or token is invalid)
     */
    void deactivateToken(String token);
    
    /**
     * Remove old/inactive tokens for a user (cleanup)
     */
    void cleanupOldTokens(Long userId, int maxTokensPerUser);
}

