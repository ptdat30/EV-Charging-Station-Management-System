// ===============================================================
// FILE: UserResponseDto.java
// PACKAGE: com.userservice.dtos
// MỤC ĐÍCH: Định nghĩa dữ liệu trả về cho client, không chứa mật khẩu.
// ===============================================================
package com.chargingservice.dtos;

import com.chargingservice.entities.User;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserResponseDto {
    // [COMMAND]: Các trường công khai, an toàn để trả về cho client.
    private Long userId;
    private String email;
    private String phone;
    private String fullName;
    private User.UserType userType;
    private User.Status status;
    private LocalDateTime createdAt;
}