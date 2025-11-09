// FILE: SubscriptionScheduler.java
package com.userservice.schedulers;

import com.userservice.entities.User;
import com.userservice.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled task to cleanup expired subscription packages
 * Runs daily at 2 AM to check and clear expired subscriptions
 */
@Component
@RequiredArgsConstructor
public class SubscriptionScheduler {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionScheduler.class);
    private final UserRepository userRepository;

    /**
     * Check and clear expired subscriptions
     * Runs every day at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * *") // Cron: second, minute, hour, day, month, day-of-week
    @Transactional
    public void clearExpiredSubscriptions() {
        log.info("Starting expired subscription cleanup job...");
        
        LocalDateTime now = LocalDateTime.now();
        
        // Find all users with expired subscriptions
        List<User> usersWithExpiredSubscriptions = userRepository.findAll().stream()
                .filter(user -> user.getSubscriptionPackage() != null)
                .filter(user -> user.getSubscriptionExpiresAt() != null)
                .filter(user -> user.getSubscriptionExpiresAt().isBefore(now))
                .toList();
        
        int clearedCount = 0;
        for (User user : usersWithExpiredSubscriptions) {
            try {
                log.info("Clearing expired {} subscription for user {} (expired at: {})", 
                        user.getSubscriptionPackage(), 
                        user.getId(), 
                        user.getSubscriptionExpiresAt());
                
                // Clear subscription
                user.setSubscriptionPackage(null);
                user.setSubscriptionExpiresAt(null);
                userRepository.save(user);
                
                clearedCount++;
            } catch (Exception e) {
                log.error("Failed to clear subscription for user {}: {}", 
                        user.getId(), e.getMessage(), e);
            }
        }
        
        if (clearedCount > 0) {
            log.info("Successfully cleared {} expired subscriptions", clearedCount);
        } else {
            log.debug("No expired subscriptions found");
        }
    }

    /**
     * Check subscriptions expiring soon (within 3 days)
     * Runs every day at 9:00 AM
     * Can be used to send reminder notifications in the future
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional(readOnly = true)
    public void checkExpiringSubscriptions() {
        log.debug("Checking for subscriptions expiring soon...");
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threeDaysLater = now.plusDays(3);
        
        // Find users with subscriptions expiring in the next 3 days
        List<User> usersWithExpiringSubscriptions = userRepository.findAll().stream()
                .filter(user -> user.getSubscriptionPackage() != null)
                .filter(user -> user.getSubscriptionExpiresAt() != null)
                .filter(user -> user.getSubscriptionExpiresAt().isAfter(now))
                .filter(user -> user.getSubscriptionExpiresAt().isBefore(threeDaysLater))
                .toList();
        
        if (!usersWithExpiringSubscriptions.isEmpty()) {
            log.info("Found {} subscriptions expiring within 3 days", usersWithExpiringSubscriptions.size());
            
            for (User user : usersWithExpiringSubscriptions) {
                log.info("User {} - {} subscription expiring at {}", 
                        user.getId(), 
                        user.getSubscriptionPackage(), 
                        user.getSubscriptionExpiresAt());
                
                // TODO: Send notification to user about expiring subscription
                // notificationServiceClient.sendExpiringSubscriptionNotification(user);
            }
        }
    }
}

