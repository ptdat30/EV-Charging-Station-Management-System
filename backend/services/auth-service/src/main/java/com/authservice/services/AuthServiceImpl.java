// FILE: AuthServiceImpl.java (trong auth-service)
package com.authservice.services;

import com.authservice.clients.UserServiceClient;
import com.authservice.dtos.LoginRequestDto;
import com.authservice.dtos.LoginResponseDto;
import com.authservice.dtos.internal.UserDetailDto;
import com.authservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserServiceClient userServiceClient;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResponseDto login(LoginRequestDto loginRequestDto) {
        log.info("Attempting login for email: {}", loginRequestDto.getEmail());

        // 1. Lấy thông tin user từ user-service
        UserDetailDto userDetails;
        try {
            userDetails = userServiceClient.getUserByEmail(loginRequestDto.getEmail());
            // UserDetailDto có thể null nếu Feign client cấu hình trả về Optional hoặc xử lý 404
            if (userDetails == null) {
                log.warn("User not found via Feign client for email: {}", loginRequestDto.getEmail());
                throw new RuntimeException("Invalid credentials");
            }
        } catch (Exception e) { // Bắt lỗi chung chung từ Feign hoặc RuntimeException
            log.error("Error fetching user details or user not found for email {}: {}", loginRequestDto.getEmail(), e.getMessage());
            // Không nên tiết lộ lỗi chi tiết, trả về lỗi chung
            throw new RuntimeException("Authentication failed due to internal error or invalid credentials.");
        }

        // 2. Kiểm tra trạng thái tài khoản
        if (userDetails.getStatus() == null || userDetails.getStatus() != UserDetailDto.Status.active) {
            log.warn("Login attempt for non-active user: {} (Status: {})", loginRequestDto.getEmail(), userDetails.getStatus());
            throw new RuntimeException("User account is not active");
        }

        // 3. So sánh mật khẩu
        if (userDetails.getPasswordHash() == null || !passwordEncoder.matches(loginRequestDto.getPassword(), userDetails.getPasswordHash())) {
            log.warn("Invalid password attempt for email: {}", loginRequestDto.getEmail());
            throw new RuntimeException("Invalid credentials");
        }

        // 4. Tạo JWT token (SỬ DỤNG userDetails)
        String token = jwtUtil.generateToken(userDetails);
        log.info("Login successful for email: {}", loginRequestDto.getEmail());

        return new LoginResponseDto(token);
    }

    @Override
    public Object register(com.authservice.dtos.RegisterRequestDto dto) {
        // Gọi user-service tạo user, có thể thông qua Feign client riêng
        try {
            // Tận dụng userServiceClient nếu có method, tạm thời trả về map tối giản
            // Ở bản đầy đủ, hãy thêm Feign method: createUser(dto)
            return java.util.Map.of("email", dto.getEmail(), "status", "created");
        } catch (Exception e) {
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }
}