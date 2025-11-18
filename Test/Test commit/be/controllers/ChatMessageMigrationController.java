package com.quitsmoking.controllers;

import com.quitsmoking.services.ChatMessageMigrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/chat-migration")
@PreAuthorize("hasRole('ADMIN')")
public class ChatMessageMigrationController {
    
    @Autowired
    private ChatMessageMigrationService migrationService;
    
    /**
     * Kiểm tra số lượng tin nhắn chưa mã hóa
     */
    @GetMapping("/check")
    public ResponseEntity<?> checkUnencryptedMessages() {
        try {
            int unencryptedCount = migrationService.countUnencryptedMessages();
            Map<String, Object> response = new HashMap<>();
            response.put("unencryptedCount", unencryptedCount);
            response.put("message", "Có " + unencryptedCount + " tin nhắn chưa mã hóa");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi kiểm tra: " + e.getMessage());
        }
    }
    
    /**
     * Migrate tất cả tin nhắn chưa mã hóa
     */
    @PostMapping("/migrate")
    public ResponseEntity<?> migrateUnencryptedMessages() {
        try {
            int migratedCount = migrationService.migrateUnencryptedMessages();
            Map<String, Object> response = new HashMap<>();
            response.put("migratedCount", migratedCount);
            response.put("message", "Đã mã hóa " + migratedCount + " tin nhắn thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi migrate: " + e.getMessage());
        }
    }
} 