// FILE: AuthServiceImpl.java
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

    private final UserServiceClient userServiceClient; // Feign client gọi user-service
    private final PasswordEncoder passwordEncoder;   // Bean từ SecurityConfig
    private final JwtUtil jwtUtil;                   // Bean tiện ích JWT

    @Override
    public LoginResponseDto login(LoginRequestDto loginRequestDto) {
        log.info("Attempting login for email: {}", loginRequestDto.getEmail());

        // 1. Gọi user-service để lấy thông tin user bằng email
        UserDetailDto userDetails;
        try {
            userDetails = userServiceClient.getUserByEmail(loginRequestDto.getEmail());
            if (userDetails == null) {
                log.warn("User not found for email: {}", loginRequestDto.getEmail());
                throw new RuntimeException("Invalid credentials"); // Hoặc exception cụ thể hơn
            }
        } catch (Exception e) {
            // Xử lý lỗi nếu user-service không phản hồi hoặc không tìm thấy user
            log.error("Error fetching user details for email {}: {}", loginRequestDto.getEmail(), e.getMessage());
            throw new RuntimeException("Authentication failed");
        }

        // 2. Kiểm tra trạng thái tài khoản
        if (userDetails.getStatus() != UserDetailDto.Status.active) {
            log.warn("Login attempt for inactive/suspended user: {}", loginRequestDto.getEmail());
            throw new RuntimeException("User account is not active");
        }

        // 3. So sánh mật khẩu người dùng nhập với mật khẩu đã mã hóa trong DB
        if (!passwordEncoder.matches(loginRequestDto.getPassword(), userDetails.getPasswordHash())) {
            log.warn("Invalid password attempt for email: {}", loginRequestDto.getEmail());
            throw new RuntimeException("Invalid credentials");
        }

        // 4. Nếu mật khẩu khớp, tạo JWT token
        String token = jwtUtil.generateToken(userDetails.getEmail()); // Dùng email làm subject
        log.info("Login successful for email: {}", loginRequestDto.getEmail());

        // 5. Trả về token cho client
        return new LoginResponseDto(token);
    }
}