// FILE: JwtUtil.java (trong auth-service)
package com.authservice.util;

import com.authservice.dtos.internal.UserDetailDto; // Import UserDetailDto
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException; // Import thêm exception
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap; // Import HashMap
import java.util.Map; // Import Map

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expirationMs}")
    private int jwtExpirationMs;

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Tạo JWT token với thông tin username, userId và role.
     * @param userDetails Thông tin chi tiết người dùng (bao gồm email, userId và userType).
     * @return Chuỗi JWT.
     */
    public String generateToken(UserDetailDto userDetails) { // Nhận vào UserDetailDto
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        // Thêm custom claims (vai trò, userId) vào token
        Map<String, Object> claims = new HashMap<>();
        // Quan trọng: Chuyển Enum thành String để lưu vào claim
        claims.put("role", userDetails.getUserType() != null ? userDetails.getUserType().name() : null);
        claims.put("userId", userDetails.getUserId());

        return Jwts.builder()
                .setClaims(claims) // Đặt các custom claims
                .setSubject(userDetails.getEmail()) // Subject vẫn là email
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    // --- Lấy thông tin từ Token ---
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getUsernameFromToken(String token) {
        try {
            return getAllClaimsFromToken(token).getSubject();
        } catch (JwtException e) {
            log.error("Error getting username from token: {}", e.getMessage());
            return null;
        }
    }

    public String getRoleFromToken(String token) {
        try {
            return getAllClaimsFromToken(token).get("role", String.class);
        } catch (JwtException e) {
            log.error("Error getting role from token: {}", e.getMessage());
            return null;
        }
    }

    public Long getUserIdFromToken(String token) {
        try {
            // Cần xử lý ClassCastException nếu userId không phải Long
            Object userIdObj = getAllClaimsFromToken(token).get("userId");
            if (userIdObj instanceof Number) {
                return ((Number) userIdObj).longValue();
            }
            return null;
        } catch (JwtException e) {
            log.error("Error getting userId from token: {}", e.getMessage());
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (SignatureException ex) {
            log.error("Invalid JWT signature: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty or null: {}", ex.getMessage());
        } catch (JwtException ex) { // Bắt các lỗi JWT khác
            log.error("JWT validation error: {}", ex.getMessage());
        }
        return false;
    }
}