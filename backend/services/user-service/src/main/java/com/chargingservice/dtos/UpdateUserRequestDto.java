// ===============================================================
// FILE: UpdateUserRequestDto.java
// PACKAGE: com.userservice.dtos
// MỤC ĐÍCH: Định nghĩa dữ liệu cho yêu cầu cập nhật thông tin người dùng.
// ===============================================================
package com.chargingservice.dtos;

import lombok.Data;

@Data
public class UpdateUserRequestDto {
    // [COMMAND]: Các trường mà client có thể gửi lên để cập nhật.
    // Chúng ta không cho phép cập nhật email hoặc userType qua API này.
    private String fullName;
    private String phone;
}