// ===============================================================
// FILE: ResourceNotFoundException.java
// PACKAGE: com.userservice.exceptions
// MỤC ĐÍCH: Exception được ném ra khi không tìm thấy tài nguyên.
// ===============================================================
package com.stationservice.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// [COMMAND]: @ResponseStatus(HttpStatus.NOT_FOUND)
// Annotation này sẽ tự động khiến Spring Boot trả về status 404 Not Found
// mỗi khi exception này được ném ra và không được xử lý ở đâu khác.
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    // [COMMAND]: Một constructor nhận vào một thông báo lỗi.
    public ResourceNotFoundException(String message) {
        super(message);
    }
}