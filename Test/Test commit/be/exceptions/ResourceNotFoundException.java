package com.quitsmoking.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Ngoại lệ được ném ra khi một tài nguyên (resource) không được tìm thấy.
 * Điều này thường ánh xạ tới mã trạng thái HTTP 404 Not Found.
 */
@ResponseStatus(HttpStatus.NOT_FOUND) // Đảm bảo Spring Boot tự động trả về 404
public class ResourceNotFoundException extends RuntimeException {

    // Constructor mặc định
    public ResourceNotFoundException() {
        super();
    }

    // Constructor với thông báo chi tiết
    public ResourceNotFoundException(String message) {
        super(message);
    }

    // Constructor với thông báo và nguyên nhân gốc
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    // Constructor với nguyên nhân gốc
    public ResourceNotFoundException(Throwable cause) {
        super(cause);
    }

    // Bạn có thể thêm các trường bổ sung nếu muốn, ví dụ: tên tài nguyên, ID
    // private String resourceName;
    // private String fieldName;
    // private Object fieldValue;

    // public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
    //     super(String.format("%s not found with %s : '%s'", resourceName, fieldName, fieldValue));
    //     this.resourceName = resourceName;
    //     this.fieldName = fieldName;
    //     this.fieldValue = fieldValue;
    // }

    // Getters nếu bạn thêm các trường trên
    // public String getResourceName() { return resourceName; }
    // public String getFieldName() { return fieldName; }
    // public Object getFieldValue() { return fieldValue; }
}