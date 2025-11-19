package com.quitsmoking.services;

import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserStatusService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserStatusService.class);
    
    private final Map<String, LocalDateTime> userLastSeen = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    @Autowired
    private ApplicationContext applicationContext;
    
    public UserStatusService() {
        // Start cleanup task
        scheduler.scheduleAtFixedRate(this::cleanupOfflineUsers, 1, 1, TimeUnit.MINUTES);
    }
    
    public void userConnected(String userId) {
        logger.info("UserStatusService: User connected - {}", userId);
        userLastSeen.put(userId, LocalDateTime.now());
        broadcastUserStatus(userId, true);
    }
    
    public void userDisconnected(String userId) {
        logger.info("UserStatusService: User disconnected - {}", userId);
        userLastSeen.remove(userId);
        broadcastUserStatus(userId, false);
    }
    
    public void userHeartbeat(String userId) {
        userLastSeen.put(userId, LocalDateTime.now());
        logger.debug("UserStatusService: Heartbeat from user - {}", userId);
        // Broadcast status update when user sends heartbeat
        broadcastUserStatus(userId, true);
    }
    
    /**
     * Track user activity via HTTP requests (for users without WebSocket)
     */
    public void userHttpActivity(String userId) {
        userLastSeen.put(userId, LocalDateTime.now());
        logger.debug("UserStatusService: HTTP activity from user - {}", userId);
        // Broadcast status update when user has HTTP activity
        broadcastUserStatus(userId, true);
    }
    
    public boolean isUserOnline(String userId) {
        LocalDateTime lastSeen = userLastSeen.get(userId);
        if (lastSeen == null) {
            return false;
        }
        
        // User được coi là online nếu hoạt động trong 10 phút gần đây
        LocalDateTime tenMinutesAgo = LocalDateTime.now().minusMinutes(10);
        boolean isOnline = lastSeen.isAfter(tenMinutesAgo);
        
        logger.debug("UserStatusService: Checking online status for {} - {}", userId, isOnline ? "ONLINE" : "OFFLINE");
        return isOnline;
    }
    
    public Map<String, Boolean> getAllUserStatuses() {
        Map<String, Boolean> statuses = new ConcurrentHashMap<>();
        userLastSeen.keySet().forEach(userId -> {
            statuses.put(userId, isUserOnline(userId));
        });
        logger.debug("UserStatusService: All user statuses - {}", statuses);
        return statuses;
    }
    
    private void broadcastUserStatus(String userId, boolean isOnline) {
        try {
            SimpMessagingTemplate messagingTemplate = applicationContext.getBean(SimpMessagingTemplate.class);
            messagingTemplate.convertAndSend("/topic/user-status", 
                Map.of("userId", userId, "online", isOnline));
            logger.debug("UserStatusService: Broadcasted status - {} is {}", userId, isOnline ? "ONLINE" : "OFFLINE");
        } catch (Exception e) {
            logger.error("UserStatusService: Error broadcasting status: {}", e.getMessage());
        }
    }
    
    public void cleanupOfflineUsers() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(10);
        userLastSeen.entrySet().removeIf(entry -> {
            if (entry.getValue().isBefore(cutoff)) {
                logger.debug("UserStatusService: Cleaning up offline user - {}", entry.getKey());
                return true;
            }
            return false;
        });
    }
    
    public Map<String, LocalDateTime> getUserStatusMap() {
        return new ConcurrentHashMap<>(userLastSeen);
    }
} 