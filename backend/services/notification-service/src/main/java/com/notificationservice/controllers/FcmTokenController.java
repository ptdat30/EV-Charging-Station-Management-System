package com.notificationservice.controllers;

import com.notificationservice.dtos.RegisterFcmTokenRequestDto;
import com.notificationservice.services.FcmTokenService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fcm-tokens")
@RequiredArgsConstructor
public class FcmTokenController {
    
    private static final Logger log = LoggerFactory.getLogger(FcmTokenController.class);
    private final FcmTokenService fcmTokenService;
    
    /**
     * Register a new FCM token for push notifications
     * POST /api/fcm-tokens/register
     */
    @PostMapping("/register")
    public ResponseEntity<String> registerToken(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody RegisterFcmTokenRequestDto requestDto) {
        
        log.info("Registering FCM token for userId: {}, deviceType: {}", userId, requestDto.getDeviceType());
        
        fcmTokenService.registerToken(
                userId,
                requestDto.getToken(),
                requestDto.getDeviceType(),
                requestDto.getDeviceId()
        );
        
        return ResponseEntity.ok("FCM token registered successfully");
    }
    
    /**
     * Get all active tokens for current user
     * GET /api/fcm-tokens/my-tokens
     */
    @GetMapping("/my-tokens")
    public ResponseEntity<List<String>> getMyTokens(@RequestHeader("X-User-Id") Long userId) {
        log.debug("Getting active FCM tokens for userId: {}", userId);
        List<String> tokens = fcmTokenService.getActiveTokensForUser(userId);
        return ResponseEntity.ok(tokens);
    }
    
    /**
     * Deactivate a specific FCM token (e.g., on logout)
     * DELETE /api/fcm-tokens/deactivate
     */
    @DeleteMapping("/deactivate")
    public ResponseEntity<String> deactivateToken(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String token) {
        
        log.info("Deactivating FCM token for userId: {}", userId);
        fcmTokenService.deactivateToken(token);
        return ResponseEntity.ok("FCM token deactivated successfully");
    }
}

