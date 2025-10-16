// ===============================================================
// FILE: RegisterRequestDto.java
// PACKAGE: com.userservice.dtos
// MỤC ĐÍCH: Định nghĩa cấu trúc dữ liệu cho yêu cầu đăng ký.
// ===============================================================
package com.userservice.dtos;

import com.userservice.entities.User;
import lombok.Data;

// [COMMAND]: @Data là annotation của Lombok, tự động tạo ra getters, setters, toString(),...
@Data
public class RegisterRequestDto {

    // [COMMAND]: Các trường dữ liệu mà client phải cung cấp khi đăng ký.
    // Sau này chúng ta sẽ thêm các validation annotation (@NotNull, @Email, @Size) ở đây.
    private String email;
    private String password;
    private String fullName;
    private String phone;

    // [COMMAND]: Chỉ định loại người dùng là 'driver' khi đăng ký.
    private User.UserType userType = User.UserType.driver;
}