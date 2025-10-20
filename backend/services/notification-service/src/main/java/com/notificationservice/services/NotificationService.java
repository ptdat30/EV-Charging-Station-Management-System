// FILE: NotificationService.java
package com.notificationservice.services;

import com.notificationservice.dtos.CreateNotificationRequestDto;
import com.notificationservice.dtos.NotificationResponseDto;

public interface NotificationService {
    /**
     * Tạo và lưu một thông báo mới vào database.
     * @param requestDto Dữ liệu thông báo cần tạo.
     * @return Thông tin chi tiết của thông báo vừa được tạo.
     */
    NotificationResponseDto createNotification(CreateNotificationRequestDto requestDto);

    // Các phương thức khác (lấy thông báo, đánh dấu đã đọc) sẽ thêm sau
}