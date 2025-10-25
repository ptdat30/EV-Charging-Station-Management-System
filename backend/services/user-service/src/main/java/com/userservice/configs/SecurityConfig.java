// FILE: SecurityConfig.java (trong user-service)
package com.userservice.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
// Import @EnableMethodSecurity
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // [COMMAND]: Bật tính năng @PreAuthorize
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
                        // API công khai
                        .requestMatchers("/api/users/register", "/api/users/by-email").permitAll()
                        // Tạm thời cho phép GET (sẽ dùng @PreAuthorize để kiểm soát)
                        // .requestMatchers(HttpMethod.GET, "/api/users/**").permitAll()
                        // Mọi request khác cần được xác thực (ít nhất là có token hợp lệ)
                        .anyRequest().authenticated()
                );
        return http.build();
    }
}