// FILE: AuthController.java (Thêm endpoint validate)
package com.authservice.controllers;

import com.authservice.dtos.LoginRequestDto;
import com.authservice.dtos.LoginResponseDto;
import com.authservice.services.AuthService;
import com.authservice.util.JwtUtil; // Import JwtUtil
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // Import thêm

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil; // Inject JwtUtil

    // POST /api/auth/login (Giữ nguyên)
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto loginRequestDto) {
        LoginResponseDto response = authService.login(loginRequestDto);
        return ResponseEntity.ok(response);
    }

    // [COMMAND]: Thêm endpoint mới để xác thực token
    // GET /api/auth/validate?token=...
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestParam("token") String token) {
        try {
            boolean isValid = jwtUtil.validateToken(token);
            if (isValid) {
                // Nếu hợp lệ, trả về thông tin user (ví dụ: username) từ token
                String username = jwtUtil.getUsernameFromToken(token);
                // Trả về đối tượng chứa username hoặc chỉ cần status OK
                return ResponseEntity.ok().body(username); // Hoặc ResponseEntity.ok().build();
            } else {
                // Nếu không hợp lệ (ví dụ hết hạn, sai chữ ký)
                return ResponseEntity.status(401).body("Invalid Token");
            }
        } catch (Exception e) {
            // Lỗi khác khi parse token
            return ResponseEntity.status(401).body("Token validation error: " + e.getMessage());
        }
    }
}