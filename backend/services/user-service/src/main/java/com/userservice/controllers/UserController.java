// ===============================================================
// FILE: UserController.java (Phiên bản đã hoàn thiện)
// PACKAGE: com.userservice.controllers
// MỤC ĐÍCH: Cung cấp đầy đủ các API endpoint CRUD cho User.
// ===============================================================
package com.userservice.controllers;

import com.userservice.dtos.RegisterRequestDto;
import com.userservice.dtos.UpdateUserRequestDto;
import com.userservice.dtos.UserResponseDto;
import com.userservice.entities.User;
import com.userservice.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // [COMMAND]: Import tổng hợp cho các annotation mapping.

import java.util.List;

// [COMMAND]: @RestController báo cho Spring biết đây là một Rest Controller.
@RestController
// [COMMAND]: @RequestMapping định nghĩa đường dẫn gốc cho tất cả các API trong class này.
@RequestMapping("/api/users")
// [COMMAND]: @RequiredArgsConstructor của Lombok tự động inject các dependency qua constructor.
@RequiredArgsConstructor
public class UserController {

    // [COMMAND]: Tiêm (inject) UserService để sử dụng.
    private final UserService userService;

    // --- CREATE ---
    // POST /api/users/register
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody RegisterRequestDto requestDto) {
        // [COMMAND]: Endpoint này trả về User entity (bao gồm cả password hash)
        // để client có thể xử lý thêm nếu cần ngay sau khi đăng ký.
        // Đây là một trường hợp ngoại lệ chấp nhận được.
        User createdUser = userService.registerUser(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    // --- READ (SINGLE) ---
    // GET /api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        UserResponseDto userDto = userService.getUserById(id);
        // [COMMAND]: Trả về status 200 OK và thông tin user (đã che mật khẩu).
        return ResponseEntity.ok(userDto);
    }

    // --- READ (ALL) ---
    // GET /api/users
    @GetMapping("/getall")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> users = userService.getAllUsers();
        // [COMMAND]: Trả về status 200 OK và danh sách tất cả user.
        return ResponseEntity.ok(users);
    }

    // --- UPDATE ---
    // PUT /api/users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDto> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequestDto requestDto) {
        UserResponseDto updatedUser = userService.updateUser(id, requestDto);
        // [COMMAND]: Trả về status 200 OK và thông tin user đã được cập nhật.
        return ResponseEntity.ok(updatedUser);
    }

    // --- DELETE ---
    // DELETE /api/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        // [COMMAND]: Trả về status 204 No Content, báo hiệu xóa thành công.
        return ResponseEntity.noContent().build();
    }
}