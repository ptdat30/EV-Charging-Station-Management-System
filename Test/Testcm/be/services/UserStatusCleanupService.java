package com.quitsmoking.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class UserStatusCleanupService {
    
    @Autowired
    private UserStatusService userStatusService;
    
    // Chạy mỗi giờ để dọn dẹp offline users
    @Scheduled(fixedRate = 3600000) // 1 hour = 3600000 milliseconds
    public void cleanupOfflineUsers() {
        userStatusService.cleanupOfflineUsers();
        System.out.println("UserStatusCleanupService: Cleaned up offline users");
    }
} 