package com.quitsmoking.config;

import com.quitsmoking.services.CustomUserDetailsService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService customUserDetailsService; // Use separate UserDetailsService

    @Autowired
    private JwtUtil jwtUtil; // Autowire JwtUtil

    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Manually create JwtRequestFilter instance here
        JwtRequestFilter jwtRequestFilter = new JwtRequestFilter(customUserDetailsService, jwtUtil);

        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(org.springframework.security.config.Customizer.withDefaults())
            .userDetailsService(customUserDetailsService) // Use separate UserDetailsService to avoid infinite loop
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Cho phép WebSocket endpoints
                .requestMatchers("/ws/**").permitAll()
                // Cho phép các endpoint xác thực cục bộ (đăng nhập, đăng ký)
                .requestMatchers("/api/auth/**").permitAll()
                // Cho phép truy cập các file trong thư mục uploads (PUBLIC)
                .requestMatchers("/uploads/**").permitAll()
                // Cho phép truy cập endpoint AI chatbox (Gemini proxy)
                .requestMatchers("/api/ai/chat").permitAll()
                // Cho phép truy cập endpoint coach-consultations
                .requestMatchers("/api/coach-consultations", "/api/coach-consultations/**").hasAnyRole("COACH", "ADMIN", "MEMBER")
                // Cho phép truy cập endpoint chat
                .requestMatchers("/api/chat/messages", "/api/chat/messages/**").hasAnyRole("MEMBER", "COACH", "ADMIN")
                // Cho phép truy cập endpoint profile
                .requestMatchers("/api/user/profile").authenticated()
                // Endpoint free-trial yêu cầu vai trò GUEST
                .requestMatchers(HttpMethod.POST, "/api/membership/free-trial").hasAnyRole("GUEST")
                // Endpoint upgrade yêu cầu các vai trò này
                .requestMatchers(HttpMethod.POST, "/api/membership/upgrade").hasAnyRole("GUEST", "MEMBER", "ADMIN", "COACH")
                // Endpoint ghi nhận tình trạng hút thuốc
                .requestMatchers(HttpMethod.POST, "/api/smoking-status/user/**").hasAnyRole("GUEST", "MEMBER", "ADMIN", "COACH")
                .requestMatchers(HttpMethod.GET, "/api/smoking-status/user/**").hasAnyRole("GUEST", "MEMBER", "ADMIN", "COACH")
                // Cho phép truy cập endpoint lập kế hoạch cai thuốc
                .requestMatchers(HttpMethod.POST, "/api/quit-plans").hasAnyRole("GUEST", "MEMBER", "ADMIN", "COACH")
                .requestMatchers(HttpMethod.GET, "/api/quit-plans").hasAnyRole("GUEST", "MEMBER", "ADMIN", "COACH")
                // Cho phép MEMBER, ADMIN, COACH truy cập tiến trình tuần
                .requestMatchers(HttpMethod.POST, "/api/daily-progress").hasAnyRole("GUEST", "MEMBER", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/daily-progress/**").hasAnyRole("GUEST", "MEMBER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/daily-progress/week").hasAnyRole("GUEST", "MEMBER", "ADMIN", "COACH")
                .requestMatchers(HttpMethod.GET, "/api/daily-progress/week/**").hasAnyRole("GUEST", "MEMBER", "ADMIN", "COACH")
                // Cho phép truy cập endpoint community
                // Cho phép guest truy cập endpoint posts nhưng không được tạo bài viết và comment
                .requestMatchers(HttpMethod.GET, "/api/community/posts/**").hasAnyRole("GUEST", "MEMBER", "ADMIN", "COACH")
                .requestMatchers(HttpMethod.GET, "/api/community/posts").hasAnyRole("GUEST", "MEMBER", "ADMIN", "COACH")
                .requestMatchers(HttpMethod.GET, "/api/community/comments").hasAnyRole("MEMBER", "ADMIN", "COACH")
                .requestMatchers(HttpMethod.POST, "/api/community/posts").hasAnyRole("MEMBER", "ADMIN", "COACH")
                .requestMatchers(HttpMethod.POST, "/api/community/posts/like/**").hasAnyRole("MEMBER", "ADMIN", "COACH")
                .requestMatchers(HttpMethod.PUT, "/api/community/posts/**").hasAnyRole("MEMBER", "ADMIN", "COACH")
                // Cho phép truy cập endpoint comments
                .requestMatchers(HttpMethod.GET, "/api/community/comments/post/**").permitAll()
                // Cho phép truy cập endpoint share dashboard
                .requestMatchers("/api/dashboard/share", "/api/dashboard/shared-coaches").hasAnyRole("MEMBER", "ADMIN", "COACH")
                .requestMatchers("/api/dashboard/shared-members").hasAnyRole("COACH", "ADMIN", "MEMBER")
                .requestMatchers("/api/dashboard/member/**").hasAnyRole("COACH", "ADMIN", "MEMBER","GUEST")
                // Cho phép truy cập endpoint achievements
                .requestMatchers("/api/achievements/**").hasAnyRole("MEMBER", "ADMIN", "COACH")
                // Cho phép admin truy cập endpoint feedback admin
                .requestMatchers("/api/feedback/admin/**").hasAnyRole("ADMIN")
                // Cho phép tất cả user đã đăng nhập truy cập endpoint feedback
                .requestMatchers("/api/feedback/**").authenticated()
                
                // Bất kỳ yêu cầu nào khác đến /api/** đều yêu cầu được xác thực                
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> response.setStatus(HttpStatus.OK.value()))
                .permitAll()
            );
            

        return http.build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowCredentials(true);
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "http://localhost:4173",
                "http://localhost:5173"

        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of(
                "Authorization", "Content-Type", "Accept", "X-Requested-With"
        ));
        configuration.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", configuration);
        System.out.println("CORS configuration initialized with allowed origins: " + configuration.getAllowedOrigins());
        return source;
    }
}