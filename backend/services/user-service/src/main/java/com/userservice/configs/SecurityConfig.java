// FILE: SecurityConfig.java (trong user-service)
package com.userservice.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Import HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Cho phép API đăng ký và API nội bộ cho auth-service
                        .requestMatchers("/api/users/register", "/api/users/by-email").permitAll()
                        // [COMMAND]: TẠM THỜI cho phép tất cả các request GET đến /api/users/**
                        .requestMatchers(HttpMethod.GET, "/api/users/**").permitAll()
                        // Mọi request khác (POST, PUT, DELETE không được liệt kê ở trên) cần xác thực
                        .anyRequest().authenticated()
                );
        return http.build();
    }
}