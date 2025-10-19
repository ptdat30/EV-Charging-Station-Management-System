// FILE: NotificationRepository.java
package com.notificationservice.repositories;

import com.notificationservice.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Các phương thức truy vấn tùy chỉnh có thể thêm sau (ví dụ: tìm theo userId)
}