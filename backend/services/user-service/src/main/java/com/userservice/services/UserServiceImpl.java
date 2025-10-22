// ===============================================================
// FILE: UserServiceImpl.java (Đã cập nhật - Mã hóa mật khẩu & Thêm phương thức mới)
// PACKAGE: com.userservice.services
// ===============================================================
package com.userservice.services;

import com.userservice.dtos.RegisterRequestDto;
import com.userservice.dtos.UpdateUserRequestDto;
import com.userservice.dtos.UserDetailDto; // Import DTO mới
import com.userservice.dtos.UserResponseDto;
import com.userservice.entities.User;
import com.userservice.exceptions.ResourceNotFoundException;
import com.userservice.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder; // Import PasswordEncoder
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class); // Thêm Logger

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // Inject PasswordEncoder

    // --- CREATE (Register User with Password Encoding) ---
    @Override
    public User registerUser(RegisterRequestDto registerRequestDto) {
        log.info("Attempting to register user with email: {}", registerRequestDto.getEmail());
        if (userRepository.findByEmail(registerRequestDto.getEmail()).isPresent()) {
            log.warn("Registration failed: Email already exists - {}", registerRequestDto.getEmail());
            throw new RuntimeException("Email already exists"); // Nên tạo Exception cụ thể hơn
        }
        User newUser = new User();
        newUser.setEmail(registerRequestDto.getEmail());
        newUser.setFullName(registerRequestDto.getFullName());
        newUser.setPhone(registerRequestDto.getPhone());
        newUser.setUserType(registerRequestDto.getUserType());

        // Mã hóa mật khẩu trước khi lưu
        newUser.setPasswordHash(passwordEncoder.encode(registerRequestDto.getPassword()));
        log.debug("Password encoded for user: {}", registerRequestDto.getEmail());

        User savedUser = userRepository.save(newUser);
        log.info("User registered successfully with ID: {}", savedUser.getUserId());
        return savedUser; // Vẫn trả về User entity (bao gồm hash) cho register
    }

    // --- READ (SINGLE) ---
    @Override
    public UserResponseDto getUserById(Long userId) {
        log.debug("Fetching user by ID: {}", userId);
        User user = findUserByIdInternal(userId);
        return convertToDto(user);
    }

    // --- READ (ALL) ---
    @Override
    public List<UserResponseDto> getAllUsers() {
        log.debug("Fetching all users");
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // --- UPDATE ---
    @Override
    public UserResponseDto updateUser(Long userId, UpdateUserRequestDto updateUserRequestDto) {
        log.info("Updating user with ID: {}", userId);
        User existingUser = findUserByIdInternal(userId);

        existingUser.setFullName(updateUserRequestDto.getFullName());
        existingUser.setPhone(updateUserRequestDto.getPhone());

        User updatedUser = userRepository.save(existingUser);
        log.info("User {} updated successfully", userId);
        return convertToDto(updatedUser);
    }

    // --- DELETE ---
    @Override
    public void deleteUser(Long userId) {
        log.info("Deleting user with ID: {}", userId);
        if (!userRepository.existsById(userId)) {
            log.warn("Delete failed: User not found with ID: {}", userId);
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
        log.info("User {} deleted successfully", userId);
    }

    // --- Internal Method for Auth Service ---
    @Override
    public UserDetailDto getUserDetailsByEmail(String email) {
        log.debug("Fetching user details by email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User details fetch failed: User not found with email: {}", email);
                    return new ResourceNotFoundException("User not found with email: " + email);
                });

        // Chuyển đổi sang DTO chứa cả password hash
        UserDetailDto detailDto = new UserDetailDto();
        detailDto.setUserId(user.getUserId());
        detailDto.setEmail(user.getEmail());
        detailDto.setPasswordHash(user.getPasswordHash()); // Quan trọng
        detailDto.setUserType(user.getUserType());
        detailDto.setStatus(user.getStatus());

        log.debug("Found user details for email: {}", email);
        return detailDto;
    }


    // --- PRIVATE HELPER METHODS ---

    // Tìm user theo ID (dùng nội bộ)
    private User findUserByIdInternal(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User lookup failed: User not found with ID: {}", userId);
                    return new ResourceNotFoundException("User not found with id: " + userId);
                });
    }

    // Chuyển User sang UserResponseDto (không chứa password hash)
    private UserResponseDto convertToDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setUserId(user.getUserId());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setFullName(user.getFullName());
        dto.setUserType(user.getUserType());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}