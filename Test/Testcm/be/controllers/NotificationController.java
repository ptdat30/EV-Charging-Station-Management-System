package com.quitsmoking.controllers;
import com.quitsmoking.model.Notification;
import com.quitsmoking.model.User;
import com.quitsmoking.services.NotificationService;
import com.quitsmoking.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private UserService userService;
    @GetMapping
    public ResponseEntity<?> getMyNotifications(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            List<Notification> notifications = notificationService.getUserNotifications(user);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            List<Notification> notifications = notificationService.getUnreadNotifications(user);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            Long count = notificationService.getUnreadNotificationCount(user);
            return ResponseEntity.ok().body("{\"count\": " + count + "}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok().body("Đã đánh dấu đã đọc");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            notificationService.markAllAsRead(user);
            return ResponseEntity.ok().body("Đã đánh dấu tất cả đã đọc");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(@PathVariable String notificationId) {
        try {
            notificationService.deleteNotification(notificationId);
            return ResponseEntity.ok().body("Đã xóa thông báo");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @PostMapping("/send-motivation")
    public ResponseEntity<?> sendMotivation(
            @RequestBody SendNotificationRequest request,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            notificationService.sendMotivationNotification(user, request.getMessage());
            return ResponseEntity.ok().body("Đã gửi thông báo động viên");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @PostMapping("/send-reminder")
    public ResponseEntity<?> sendReminder(
            @RequestBody SendNotificationRequest request,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            notificationService.sendReminderNotification(user, request.getMessage());
            return ResponseEntity.ok().body("Đã gửi thông báo nhắc nhở");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    @PostMapping("/schedule")
    public ResponseEntity<?> scheduleNotification(
            @RequestBody ScheduleNotificationRequest request,
            Authentication authentication) {
        try {
            User user = userService.findByUsername(authentication.getName());
            notificationService.scheduleNotification(
                user,
                request.getTitle(),
                request.getMessage(),
                request.getType(),
                request.getScheduledTime()
            );
            return ResponseEntity.ok().body("Đã lên lịch thông báo");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
    // DTO classes
    public static class SendNotificationRequest {
        private String message;
        public SendNotificationRequest() {}
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
    public static class ScheduleNotificationRequest {
        private String title;
        private String message;
        private Notification.NotificationType type;
        private LocalDateTime scheduledTime;
        public ScheduleNotificationRequest() {}
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public Notification.NotificationType getType() { return type; }
        public void setType(Notification.NotificationType type) { this.type = type; }
        public LocalDateTime getScheduledTime() { return scheduledTime; }
        public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }
    }
}