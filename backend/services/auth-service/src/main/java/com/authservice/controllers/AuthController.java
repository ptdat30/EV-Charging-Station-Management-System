// FILE: AuthController.java (trong auth-service)
package com.authservice.controllers;

import com.authservice.dtos.LoginRequestDto;
import com.authservice.dtos.LoginResponseDto;
import com.authservice.dtos.RegisterRequestDto;
import com.authservice.services.AuthService;
import com.authservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class); // Thêm Logger
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto loginRequestDto) {
        log.info("Received login request for email: {}", loginRequestDto.getEmail());
        // Service sẽ xử lý lỗi và ném exception nếu đăng nhập thất bại
        LoginResponseDto response = authService.login(loginRequestDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDto registerRequestDto) {
        log.info("Received register request for email: {}", registerRequestDto.getEmail());
        return ResponseEntity.status(201).body(authService.register(registerRequestDto));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // JWT stateless: frontend xoá token. Có thể bổ sung blacklist nếu cần.
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestParam("token") String token) {
        log.debug("Received validation request for token"); // Không log token
        try {
            boolean isValid = jwtUtil.validateToken(token);
            if (isValid) {
                String username = jwtUtil.getUsernameFromToken(token);
                String role = jwtUtil.getRoleFromToken(token);
                Long userId = jwtUtil.getUserIdFromToken(token);
                log.debug("Token validation successful for user {}", username);
                // Trả về Map chứa các thông tin cần thiết
                return ResponseEntity.ok(Map.of(
                        "isValid", true,
                        "username", username,
                        "role", role != null ? role : "UNKNOWN", // Tránh trả về null
                        "userId", userId != null ? userId : -1L   // Tránh trả về null
                ));
            } else {
                log.warn("Token validation failed (invalid/expired)");
                return ResponseEntity.status(401).body(Map.of("isValid", false, "error", "Invalid or Expired Token"));
            }
        } catch (Exception e) {
            // Lỗi khi parse hoặc lỗi không mong muốn khác
            log.error("Token validation error: {}", e.getMessage());
            return ResponseEntity.status(401).body(Map.of("isValid", false, "error", "Token validation error"));
        }
    }
}