package com.quitsmoking.services;
import com.quitsmoking.model.Achievement;
import com.quitsmoking.model.Notification;
import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;
    private final String[] motivationalMessages = {
        "Bạn đang làm rất tốt! Hãy tiếp tục duy trì!",
        "Mỗi ngày không hút thuốc là một chiến thắng!",
        "Sức khỏe của bạn đang được cải thiện từng ngày!",
        "Hãy nhớ lý do tại sao bạn muốn cai thuốc!",
        "Bạn mạnh mẽ hơn cơn thèm thuốc!",
        "Tương lai khỏe mạnh đang chờ đợi bạn!",
        "Mỗi điếu thuốc từ chối là một bước tiến!",
        "Gia đình bạn tự hào về quyết định này!",
        "Tiền tiết kiệm được có thể mua nhiều thứ hay ho!",
        "Cơ thể bạn đang cảm ơn bạn vì quyết định này!"
    };
    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }
    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }
    public Long getUnreadNotificationCount(User user) {
        return notificationRepository.countUnreadNotifications(user);
    }
    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }
    public void sendAchievementNotification(User user, Achievement achievement) {
        String title = "🏆 Chúc mừng! Bạn đã đạt được thành tích mới!";
        String message = String.format("Bạn đã nhận được huy hiệu '%s': %s", 
                                     achievement.getName(), achievement.getDescription());
        
        Notification notification = new Notification(user, title, message, 
                                                   Notification.NotificationType.ACHIEVEMENT);
        notificationRepository.save(notification);
    }
    public void sendMotivationNotification(User user, String customMessage) {
        String title = "💪 Động viên cho bạn!";
        String message = customMessage != null ? customMessage : getRandomMotivationalMessage();
        
        Notification notification = new Notification(user, title, message, 
                                                   Notification.NotificationType.MOTIVATION);
        notificationRepository.save(notification);
    }
    public void sendReminderNotification(User user, String reminderMessage) {
        String title = "⏰ Nhắc nhở";
        
        Notification notification = new Notification(user, title, reminderMessage, 
                                                   Notification.NotificationType.REMINDER);
        notificationRepository.save(notification);
    }
    public void scheduleNotification(User user, String title, String message, 
                                   Notification.NotificationType type, LocalDateTime scheduledTime) {
        Notification notification = new Notification(user, title, message, type);
        notification.setScheduledTime(scheduledTime);
        notificationRepository.save(notification);
    }
    private String getRandomMotivationalMessage() {
        Random random = new Random();
        return motivationalMessages[random.nextInt(motivationalMessages.length)];
    }
    // Scheduled task để gửi thông báo động viên hàng ngày
    @Scheduled(cron = "0 0 9 * * ?") // Mỗi ngày lúc 9h sáng
    public void sendDailyMotivation() {
        // Logic để gửi thông báo cho tất cả users active
        // Có thể implement sau khi có UserService
    }
    // Scheduled task để gửi thông báo nhắc nhở hàng tuần
    @Scheduled(cron = "0 0 9 * * MON") // Mỗi thứ 2 lúc 9h sáng
    public void sendWeeklyReminder() {
        // Logic để gửi thông báo nhắc nhở lý do cai thuốc
    }
    // Xử lý thông báo đã được lên lịch
    @Scheduled(fixedRate = 60000) // Kiểm tra mỗi phút
    public void processScheduledNotifications() {
        List<Notification> scheduledNotifications = 
            notificationRepository.findScheduledNotifications(LocalDateTime.now());
        
        for (Notification notification : scheduledNotifications) {
            // Đánh dấu là đã gửi bằng cách xóa scheduled_time
            notification.setScheduledTime(null);
            notificationRepository.save(notification);
        }
    }
    public void sendCustomNotification(User user, String title, String message, 
                                     Notification.NotificationType type) {
        Notification notification = new Notification(user, title, message, type);
        notificationRepository.save(notification);
    }
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }
    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = getUnreadNotifications(user);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }
}