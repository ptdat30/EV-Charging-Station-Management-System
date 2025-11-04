// FILE: NotificationRepository.java
package com.notificationservice.repositories;

import com.notificationservice.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    /**
     * Lấy tất cả notifications của user, sắp xếp theo thời gian tạo (mới nhất trước)
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Đếm số notifications chưa đọc của user
     */
    long countByUserIdAndIsReadFalse(Long userId);

    /**
     * Đánh dấu tất cả notifications của user đã đọc
     */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") Long userId);
}