// FILE: NotificationController.java
package com.notificationservice.controllers;

import com.notificationservice.dtos.CreateNotificationRequestDto;
import com.notificationservice.dtos.NotificationResponseDto;
import com.notificationservice.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // POST /api/notifications
    @PostMapping
    public ResponseEntity<NotificationResponseDto> createNotification(@RequestBody CreateNotificationRequestDto requestDto) {
        NotificationResponseDto createdNotification = notificationService.createNotification(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNotification);
    }

    // GET /api/notifications?userId={userId}
    @GetMapping
    public ResponseEntity<List<NotificationResponseDto>> getNotifications(@RequestParam Long userId) {
        List<NotificationResponseDto> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    // GET /api/notifications/unread-count?userId={userId}
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam Long userId) {
        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // PATCH /api/notifications/{notificationId}/read
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponseDto> markAsRead(@PathVariable Long notificationId) {
        NotificationResponseDto updated = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(updated);
    }

    // PATCH /api/notifications/mark-all-read?userId={userId}
    @PatchMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@RequestParam Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    // DELETE /api/notifications/{notificationId}
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }
}