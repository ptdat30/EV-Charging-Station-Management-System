package com.notificationservice.services;

import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FirebaseMessagingService {
    
    private static final Logger log = LoggerFactory.getLogger(FirebaseMessagingService.class);
    private final FcmTokenService fcmTokenService;
    
    /**
     * Send push notification to a single device token
     */
    public void sendPushNotification(String fcmToken, String title, String body, Map<String, String> data) {
        try {
            Message message = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putAllData(data != null ? data : Map.of())
                    .build();
            
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent push notification to token: {}..., response: {}", 
                    fcmToken.substring(0, Math.min(10, fcmToken.length())), response);
            
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send push notification to token: {}..., error: {}", 
                    fcmToken.substring(0, Math.min(10, fcmToken.length())), e.getMessage());
            
            // If token is invalid or not registered, deactivate it
            if (e.getMessagingErrorCode() == MessagingErrorCode.INVALID_ARGUMENT ||
                e.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                log.warn("Deactivating invalid FCM token: {}...", fcmToken.substring(0, Math.min(10, fcmToken.length())));
                fcmTokenService.deactivateToken(fcmToken);
            }
        } catch (Exception e) {
            log.error("Unexpected error sending push notification: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send push notification to multiple device tokens (batch)
     */
    public void sendPushNotificationToMultipleTokens(List<String> fcmTokens, String title, String body, Map<String, String> data) {
        if (fcmTokens == null || fcmTokens.isEmpty()) {
            log.warn("No FCM tokens provided for push notification");
            return;
        }
        
        log.info("Sending push notification to {} devices", fcmTokens.size());
        
        // Firebase allows batch sending up to 500 tokens at once
        int batchSize = 500;
        for (int i = 0; i < fcmTokens.size(); i += batchSize) {
            List<String> batch = fcmTokens.subList(i, Math.min(i + batchSize, fcmTokens.size()));
            sendBatch(batch, title, body, data);
        }
    }
    
    private void sendBatch(List<String> tokens, String title, String body, Map<String, String> data) {
        try {
            MulticastMessage message = MulticastMessage.builder()
                    .addAllTokens(tokens)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putAllData(data != null ? data : Map.of())
                    .build();
            
            @SuppressWarnings("deprecation")
            BatchResponse response = FirebaseMessaging.getInstance().sendMulticast(message);
            log.info("Successfully sent {} notifications, {} failed", response.getSuccessCount(), response.getFailureCount());
            
            // Handle failed tokens
            if (response.getFailureCount() > 0) {
                List<SendResponse> responses = response.getResponses();
                List<String> failedTokens = new ArrayList<>();
                
                for (int i = 0; i < responses.size(); i++) {
                    if (!responses.get(i).isSuccessful()) {
                        failedTokens.add(tokens.get(i));
                        
                        // Deactivate invalid tokens
                        FirebaseMessagingException exception = responses.get(i).getException();
                        if (exception != null && 
                            (exception.getMessagingErrorCode() == MessagingErrorCode.INVALID_ARGUMENT ||
                             exception.getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED)) {
                            fcmTokenService.deactivateToken(tokens.get(i));
                        }
                    }
                }
                
                log.warn("Failed to send to {} tokens", failedTokens.size());
            }
            
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send batch push notification: {}", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error sending batch push notification: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Send notification to a topic
     */
    public void sendToTopic(String topic, String title, String body, Map<String, String> data) {
        try {
            Message message = Message.builder()
                    .setTopic(topic)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .putAllData(data != null ? data : Map.of())
                    .build();
            
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent push notification to topic: {}, response: {}", topic, response);
            
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send push notification to topic: {}, error: {}", topic, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error sending push notification to topic: {}", e.getMessage(), e);
        }
    }
}

