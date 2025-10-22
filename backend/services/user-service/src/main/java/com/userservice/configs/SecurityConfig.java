// FILE: SecurityConfig.java (trong user-service)
package com.userservice.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Bean để mã hóa mật khẩu
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Cấu hình cơ bản cho phép truy cập API đăng ký và lấy user theo email
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF cho API
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/users/register").permitAll() // Cho phép đăng ký
                        .requestMatchers("/api/users/by-email").permitAll() // Cho phép auth-service gọi nội bộ
                        .anyRequest().authenticated() // Các request khác cần xác thực (sẽ cấu hình sau)
                );
        return http.build();
    }
}