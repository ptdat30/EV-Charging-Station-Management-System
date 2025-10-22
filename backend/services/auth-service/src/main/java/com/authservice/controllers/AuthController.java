// FILE: AuthController.java
package com.authservice.controllers;

import com.authservice.dtos.LoginRequestDto;
import com.authservice.dtos.LoginResponseDto;
import com.authservice.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto loginRequestDto) {
        // Gọi service để xử lý đăng nhập và tạo token
        LoginResponseDto response = authService.login(loginRequestDto);
        return ResponseEntity.ok(response); // Trả về token nếu thành công
    }
}