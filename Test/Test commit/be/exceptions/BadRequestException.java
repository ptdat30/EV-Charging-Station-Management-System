package com.quitsmoking.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Ngoại lệ được ném ra khi yêu cầu của client không hợp lệ do vi phạm logic nghiệp vụ
 * hoặc dữ liệu đầu vào không chính xác.
 * Điều này thường ánh xạ tới mã trạng thái HTTP 400 Bad Request.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST) // Đảm bảo Spring Boot tự động trả về 400
public class BadRequestException extends RuntimeException {

    // Constructor mặc định
    public BadRequestException() {
        super();
    }

    // Constructor với thông báo chi tiết
    public BadRequestException(String message) {
        super(message);
    }

    // Constructor với thông báo và nguyên nhân gốc
    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }

    // Constructor với nguyên nhân gốc
    public BadRequestException(Throwable cause) {
        super(cause);
    }
}