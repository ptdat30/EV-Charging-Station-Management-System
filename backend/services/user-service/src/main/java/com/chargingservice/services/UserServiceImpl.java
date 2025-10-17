// ===============================================================
// FILE: UserServiceImpl.java (Phiên bản đã sửa lỗi và hợp nhất)
// PACKAGE: com.userservice.services
// MỤC ĐÍCH: Triển khai toàn bộ logic CRUD cho User.
// ===============================================================
package com.chargingservice.services;

import com.chargingservice.dtos.RegisterRequestDto;
import com.chargingservice.dtos.UpdateUserRequestDto;
import com.chargingservice.dtos.UserResponseDto;
import com.chargingservice.entities.User;
import com.chargingservice.exceptions.ResourceNotFoundException;
import com.chargingservice.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

// [COMMAND]: @Service đánh dấu đây là một Spring component thuộc tầng Service.
@Service
// [COMMAND]: @RequiredArgsConstructor của Lombok tự động tạo constructor cho các trường final.
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    // [COMMAND]: Tiêm (inject) UserRepository để thao tác với database.
    private final UserRepository userRepository;

    // --- CREATE ---
    @Override
    public User registerUser(RegisterRequestDto registerRequestDto) {
        // [COMMAND]: Kiểm tra xem email đã tồn tại chưa.
        if (userRepository.findByEmail(registerRequestDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        // [COMMAND]: Tạo và lưu người dùng mới.
        User newUser = new User();
        newUser.setEmail(registerRequestDto.getEmail());
        newUser.setFullName(registerRequestDto.getFullName());
        newUser.setPhone(registerRequestDto.getPhone());
        newUser.setUserType(registerRequestDto.getUserType());
        newUser.setPasswordHash(registerRequestDto.getPassword()); // Tạm thời vẫn lưu plaintext
        return userRepository.save(newUser);
    }

    // --- READ (SINGLE) ---
    @Override
    public UserResponseDto getUserById(Long userId) {
        // [COMMAND]: Tìm user trong DB bằng ID, nếu không thấy sẽ ném ra ResourceNotFoundException.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // [COMMAND]: Chuyển đổi từ Entity sang DTO và trả về.
        return convertToDto(user);
    }

    // --- READ (ALL) ---
    @Override
    public List<UserResponseDto> getAllUsers() {
        // [COMMAND]: Lấy tất cả user từ DB.
        List<User> users = userRepository.findAll();
        // [COMMAND]: Dùng Stream API để chuyển đổi cả danh sách sang DTO.
        return users.stream()
                .map(this::convertToDto) // Tái sử dụng phương thức convertToDto
                .collect(Collectors.toList());
    }

    // --- UPDATE ---
    @Override
    public UserResponseDto updateUser(Long userId, UpdateUserRequestDto updateUserRequestDto) {
        // [COMMAND]: Tìm user cần cập nhật.
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // [COMMAND]: Cập nhật các trường thông tin từ DTO.
        existingUser.setFullName(updateUserRequestDto.getFullName());
        existingUser.setPhone(updateUserRequestDto.getPhone());

        // [COMMAND]: Lưu lại user đã được cập nhật vào DB.
        User updatedUser = userRepository.save(existingUser);

        // [COMMAND]: Chuyển đổi sang DTO để trả về.
        return convertToDto(updatedUser);
    }

    // --- DELETE ---
    @Override
    public void deleteUser(Long userId) {
        // [COMMAND]: Kiểm tra xem user có tồn tại không trước khi xóa.
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        // [COMMAND]: Nếu user tồn tại, tiến hành xóa.
        userRepository.deleteById(userId);
    }

    // [COMMAND]: Phương thức private helper để chuyển đổi User Entity sang UserResponseDto.
    // Giúp tránh lặp lại code ở nhiều nơi (DRY - Don't Repeat Yourself).
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