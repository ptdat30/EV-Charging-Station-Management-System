// FILE: NotificationService.java
package com.notificationservice.services;

import com.notificationservice.dtos.CreateNotificationRequestDto;
import com.notificationservice.dtos.NotificationResponseDto;

import java.util.List;

public interface NotificationService {
    /**
     * Tạo và lưu một thông báo mới vào database.
     * @param requestDto Dữ liệu thông báo cần tạo.
     * @return Thông tin chi tiết của thông báo vừa được tạo.
     */
    NotificationResponseDto createNotification(CreateNotificationRequestDto requestDto);

    /**
     * Lấy danh sách notifications của user
     * @param userId User ID
     * @return Danh sách notifications
     */
    List<NotificationResponseDto> getNotificationsByUserId(Long userId);

    /**
     * Đánh dấu notification đã đọc
     * @param notificationId Notification ID
     * @return Notification đã được cập nhật
     */
    NotificationResponseDto markAsRead(Long notificationId);

    /**
     * Đánh dấu tất cả notifications của user đã đọc
     * @param userId User ID
     */
    void markAllAsRead(Long userId);

    /**
     * Xóa notification
     * @param notificationId Notification ID
     */
    void deleteNotification(Long notificationId);

    /**
     * Đếm số notifications chưa đọc của user
     * @param userId User ID
     * @return Số lượng notifications chưa đọc
     */
    Long getUnreadCount(Long userId);
}