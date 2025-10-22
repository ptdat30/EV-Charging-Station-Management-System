// ===============================================================
// FILE: UserService.java (Đã cập nhật)
// PACKAGE: com.userservice.services
// ===============================================================
package com.userservice.services;

import com.userservice.dtos.RegisterRequestDto;
import com.userservice.dtos.UpdateUserRequestDto;
import com.userservice.dtos.UserDetailDto; // Import DTO mới
import com.userservice.dtos.UserResponseDto;
import com.userservice.entities.User;
import java.util.List;

public interface UserService {

    // --- CRUD Methods ---
    User registerUser(RegisterRequestDto registerRequestDto); // Sẽ mã hóa mật khẩu
    UserResponseDto getUserById(Long userId);
    List<UserResponseDto> getAllUsers();
    UserResponseDto updateUser(Long userId, UpdateUserRequestDto updateUserRequestDto);
    void deleteUser(Long userId);

    // --- Internal Method for Auth Service ---
    /**
     * Lấy thông tin chi tiết (bao gồm password hash) của người dùng theo email.
     * Dùng cho việc xác thực nội bộ bởi auth-service.
     * @param email Email của người dùng cần tìm.
     * @return UserDetailDto chứa thông tin cần thiết cho xác thực.
     */
    UserDetailDto getUserDetailsByEmail(String email);
}