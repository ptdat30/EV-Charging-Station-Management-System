// ===============================================================
// FILE: ResourceNotFoundException.java
// PACKAGE: com.chargingservice.exceptions
// MỤC ĐÍCH: Exception được ném ra khi không tìm thấy phiên sạc.
// ===============================================================
package com.notificationservice.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}