package com.quitsmoking.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.quitsmoking.services.CustomUserDetailsService;

import io.jsonwebtoken.ExpiredJwtException;

import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtUtil jwtUtil;

    public JwtRequestFilter(CustomUserDetailsService customUserDetailsService, JwtUtil jwtUtil) {
        this.customUserDetailsService = customUserDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        String requestMethod = request.getMethod();

        // Bỏ qua logging cho các request không quan trọng
        if (!requestURI.startsWith("/ws") && !requestURI.startsWith("/static") && !requestURI.startsWith("/favicon")) {
            logger.debug("JwtRequestFilter: Processing request for URI: {} and Method: {}", requestURI, requestMethod);
        }

        // 1. Bỏ qua các yêu cầu OPTIONS (preflight)
        if ("OPTIONS".equalsIgnoreCase(requestMethod)) {
            chain.doFilter(request, response);
            return;
        }

        // 2. Bỏ qua xác thực cho các endpoint public
        if (requestURI.startsWith("/api/auth/") ||
                requestURI.startsWith("/oauth2/") ||
                requestURI.startsWith("/login/oauth2") ||
                (requestURI.startsWith("/api/community/comments/post/") && "GET".equalsIgnoreCase(requestMethod))) {
            chain.doFilter(request, response);
            return;
        }

        // 3. Xử lý JWT cho các request cần xác thực
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                logger.debug("Extracted username from JWT: {}", username);
            } catch (ExpiredJwtException e) {
                logger.warn("JWT Token expired for URI {}: {}", requestURI, e.getMessage());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT Token expired");
                return;
            } catch (Exception e) {
                logger.warn("Invalid JWT Token for URI {}: {}", requestURI, e.getMessage());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT Token");
                return;
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = null;
            try {
                userDetails = this.customUserDetailsService.loadUserByUsername(username);
            } catch (Exception e) {
                logger.error("Không thể tải thông tin chi tiết người dùng cho tên người dùng '{}': {}", username, e.getMessage());
                // Nếu không thể tải thông tin chi tiết người dùng (ví dụ: không tìm thấy người dùng trong DB), coi như chưa được xác thực
            }

            // Thêm log chi tiết để debug
            if (userDetails != null) {
                logger.debug("Authorities của userDetails: {}", userDetails.getAuthorities());
                logger.debug("JWT: {}", jwt);
                boolean isValid = jwtUtil.validateToken(jwt, userDetails);
                logger.debug("validateToken(jwt, userDetails): {}", isValid);
                if (isValid) {
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                    logger.debug("Authenticated user: {}", username);
                }
            }
        }

        chain.doFilter(request, response);
    }
}