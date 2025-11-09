package com.notificationservice.services;

import com.notificationservice.entities.FcmToken;
import com.notificationservice.repositories.FcmTokenRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FcmTokenServiceImpl implements FcmTokenService {
    
    private static final Logger log = LoggerFactory.getLogger(FcmTokenServiceImpl.class);
    private final FcmTokenRepository fcmTokenRepository;
    private static final int DEFAULT_MAX_TOKENS_PER_USER = 5;
    
    @Override
    @Transactional
    public void registerToken(Long userId, String token, String deviceType, String deviceId) {
        log.info("Registering FCM token for userId: {}, deviceType: {}, deviceId: {}", userId, deviceType, deviceId);
        
        // Check if token already exists
        Optional<FcmToken> existingToken = fcmTokenRepository.findByToken(token);
        
        if (existingToken.isPresent()) {
            // Update existing token
            FcmToken fcmToken = existingToken.get();
            fcmToken.setUserId(userId);
            fcmToken.setDeviceType(deviceType);
            fcmToken.setDeviceId(deviceId);
            fcmToken.setIsActive(true);
            fcmToken.setLastUsedAt(LocalDateTime.now());
            fcmTokenRepository.save(fcmToken);
            log.info("Updated existing FCM token for userId: {}", userId);
        } else {
            // Create new token
            FcmToken fcmToken = new FcmToken();
            fcmToken.setUserId(userId);
            fcmToken.setToken(token);
            fcmToken.setDeviceType(deviceType);
            fcmToken.setDeviceId(deviceId);
            fcmToken.setIsActive(true);
            fcmToken.setLastUsedAt(LocalDateTime.now());
            fcmTokenRepository.save(fcmToken);
            log.info("Created new FCM token for userId: {}", userId);
        }
        
        // Cleanup old tokens if user has too many
        cleanupOldTokens(userId, DEFAULT_MAX_TOKENS_PER_USER);
    }
    
    @Override
    public List<String> getActiveTokensForUser(Long userId) {
        List<FcmToken> tokens = fcmTokenRepository.findByUserIdAndIsActiveTrue(userId);
        return tokens.stream()
                .map(FcmToken::getToken)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void deactivateToken(String token) {
        log.info("Deactivating FCM token: {}", token.substring(0, Math.min(10, token.length())) + "...");
        fcmTokenRepository.deactivateToken(token);
    }
    
    @Override
    @Transactional
    public void cleanupOldTokens(Long userId, int maxTokensPerUser) {
        long tokenCount = fcmTokenRepository.countByUserIdAndIsActiveTrue(userId);
        
        if (tokenCount > maxTokensPerUser) {
            log.info("User {} has {} tokens, cleaning up old tokens (keeping {})", userId, tokenCount, maxTokensPerUser);
            
            // Get all active tokens sorted by last used date (most recent first)
            List<FcmToken> allTokens = fcmTokenRepository.findByUserIdAndIsActiveTrue(userId);
            allTokens.sort((a, b) -> {
                LocalDateTime timeA = a.getLastUsedAt() != null ? a.getLastUsedAt() : a.getCreatedAt();
                LocalDateTime timeB = b.getLastUsedAt() != null ? b.getLastUsedAt() : b.getCreatedAt();
                return timeB.compareTo(timeA); // Most recent first
            });
            
            // Keep only the most recent tokens
            List<Long> keepTokenIds = allTokens.stream()
                    .limit(maxTokensPerUser)
                    .map(FcmToken::getFcmTokenId)
                    .collect(Collectors.toList());
            
            if (!keepTokenIds.isEmpty()) {
                fcmTokenRepository.deactivateOldTokensExcept(userId, keepTokenIds);
                log.info("Cleaned up old tokens for user {}, keeping {} most recent tokens", userId, keepTokenIds.size());
            }
        }
    }
}

