// ===============================================================
// FILE: UserController.java (Đã cập nhật - Thêm endpoint mới)
// PACKAGE: com.userservice.controllers
// ===============================================================
package com.userservice.controllers;

import com.userservice.dtos.RegisterRequestDto;
import com.userservice.dtos.UpdateUserRequestDto;
import com.userservice.dtos.UserDetailDto; // Import DTO mới
import com.userservice.dtos.UserResponseDto;
import com.userservice.entities.User;
import com.userservice.services.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class); // Thêm Logger
    private final UserService userService;

    // --- CREATE ---
    // POST /api/users/register
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody RegisterRequestDto requestDto) {
        log.info("Received request to register user: {}", requestDto.getEmail());
        User createdUser = userService.registerUser(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    // --- READ (SINGLE) ---
    // GET /api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        log.info("Received request to get user by ID: {}", id);
        UserResponseDto userDto = userService.getUserById(id);
        return ResponseEntity.ok(userDto);
    }

    // --- READ (ALL) ---
    // GET /api/users/getall
    @GetMapping("/getall")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        log.info("Received request to get all users");
        List<UserResponseDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // --- UPDATE ---
    // PUT /api/users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDto> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequestDto requestDto) {
        log.info("Received request to update user: {}", id);
        UserResponseDto updatedUser = userService.updateUser(id, requestDto);
        return ResponseEntity.ok(updatedUser);
    }

    // --- DELETE ---
    // DELETE /api/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("Received request to delete user: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // --- Internal Endpoint for Auth Service ---
    /**
     * Endpoint nội bộ để auth-service lấy thông tin user theo email.
     * Không nên gọi trực tiếp từ client bên ngoài.
     */
    // GET /api/users/by-email?email=test@example.com
    @GetMapping("/by-email")
    public ResponseEntity<UserDetailDto> getUserByEmail(@RequestParam("email") String email) {
        log.info("Received internal request to get user by email: {}", email);
        UserDetailDto userDetails = userService.getUserDetailsByEmail(email);
        return ResponseEntity.ok(userDetails);
    }
}