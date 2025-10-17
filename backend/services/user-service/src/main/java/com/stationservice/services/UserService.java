// ===============================================================
// FILE: UserService.java (Thêm 3 phương thức mới)
// ===============================================================
package com.stationservice.services;

import com.stationservice.dtos.RegisterRequestDto;
import com.stationservice.dtos.UpdateUserRequestDto;
import com.stationservice.dtos.UserResponseDto;
import com.stationservice.entities.User;
import java.util.List; // [COMMAND]: Import thêm List

public interface UserService {
    User registerUser(RegisterRequestDto registerRequestDto);
    UserResponseDto getUserById(Long userId);

    // [COMMAND]: 1. Lấy danh sách tất cả người dùng.
    List<UserResponseDto> getAllUsers();

    // [COMMAND]: 2. Cập nhật thông tin người dùng.
    UserResponseDto updateUser(Long userId, UpdateUserRequestDto updateUserRequestDto);

    // [COMMAND]: 3. Xóa một người dùng.
    void deleteUser(Long userId);
}