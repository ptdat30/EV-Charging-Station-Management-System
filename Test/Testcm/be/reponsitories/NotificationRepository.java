package com.quitsmoking.reponsitories;
import com.quitsmoking.model.Notification;
import com.quitsmoking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
    
    List<Notification> findByNotificationTypeOrderByCreatedAtDesc(Notification.NotificationType type);
    
    @Query("SELECT n FROM Notification n WHERE n.scheduledTime <= :now AND n.scheduledTime IS NOT NULL ORDER BY n.scheduledTime")
    List<Notification> findScheduledNotifications(@Param("now") LocalDateTime now);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = :user AND n.isRead = false")
    Long countUnreadNotifications(@Param("user") User user);
}