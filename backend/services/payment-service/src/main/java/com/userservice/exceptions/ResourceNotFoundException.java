// ===============================================================
// FILE: ResourceNotFoundException.java (Phiên bản đã sửa lỗi)
// PACKAGE: com.paymentservice.exceptions (hoặc package tương ứng)
// MỤC ĐÍCH: Exception được ném ra khi không tìm thấy tài nguyên.
// ===============================================================
package com.userservice.exceptions; // Đảm bảo package này đúng

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// [COMMAND]: Thêm "extends RuntimeException" vào đây
@ResponseStatus(HttpStatus.NOT_FOUND) // Giữ lại annotation này để tự động trả về 404
public class ResourceNotFoundException extends RuntimeException {

    // [COMMAND]: Constructor vẫn giữ nguyên
    public ResourceNotFoundException(String message) {
        super(message); // Gọi constructor của lớp cha (RuntimeException)
    }
}