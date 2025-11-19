package com.quitsmoking.services;

import com.quitsmoking.dto.request.RegisterRequest;
import com.quitsmoking.model.*;
import com.quitsmoking.reponsitories.UserDAO;
import com.quitsmoking.services.interfaces.iRegistrableService;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import com.quitsmoking.exceptions.EmailAlreadyExistsException; 
import com.quitsmoking.exceptions.UserAlreadyExistsException;

import org.springframework.beans.factory.annotation.Autowired;
import com.quitsmoking.model.interfaces.iAuthenticatable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger; 
import org.slf4j.LoggerFactory;
import com.quitsmoking.config.JwtUtil;

import java.util.Optional;

@Service
public class AuthService implements iRegistrableService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class); // Khởi tạo logger

    private final UserDAO userDAO;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

        // Thêm các dependency mới
    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpManagementService otpService;

    public AuthService(UserDAO userDAO, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userDAO = userDAO;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // Thêm methods cho reset password
    public void sendPasswordResetOtp(String email) {
        User user = userDAO.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));
        
        // Log thông tin user để tracking
        logger.info("Sending password reset OTP to user: {} (ID: {})", user.getUsername(), user.getId());
        
        String otp = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otp);
        
        logger.info("Password reset OTP sent successfully to: {}", email);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        if (!otpService.validateOtp(email, otp)) {
            logger.warn("Invalid OTP attempt for email: {}", email);
            throw new IllegalArgumentException("Mã OTP không hợp lệ hoặc đã hết hạn");
        }
        
        User user = userDAO.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));
        
        logger.info("Resetting password for user: {} (ID: {})", user.getUsername(), user.getId());
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userDAO.save(user);
        
        logger.info("Password reset successfully for user: {}", user.getUsername());
    }

    // Removed loadUserByUsername method to avoid infinite loop
    // This method is now handled by CustomUserDetailsService

        @Override
    public User register(String username, String rawPassword, String email, String firstName, String lastName, Role requestedRole) {
        // Kiểm tra dữ liệu đầu vào
        if (username == null || username.trim().isEmpty() ||
                rawPassword == null || rawPassword.isEmpty() ||
                email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Missing required registration fields.");
        }

        // Kiểm tra username hoặc email đã tồn tại
        if (userDAO.findByUsername(username).isPresent()) {
            throw new UserAlreadyExistsException("Ten dang nhap '" + username + "' da ton tai.");
        }
        if (userDAO.findByEmail(email).isPresent()) {
            throw new EmailAlreadyExistsException("Email '" + email + "' da duoc su dung.");
        }

        // Mã hóa mật khẩu
        String encodedPassword = passwordEncoder.encode(rawPassword);

        // Tạo LocalUser
        LocalUser user = new LocalUser(
                username,
                encodedPassword,
                email,
                firstName != null ? firstName : "",
                lastName != null ? lastName : "",
                Role.GUEST // Mặc định là GUEST
        );

        // Lưu vào cơ sở dữ liệu
        return userDAO.save(user);
    }

    public User registerNewUser(RegisterRequest registerRequest) {
        // Gọi phương thức register để tái sử dụng logic
        return register(
                registerRequest.getUsername(),
                registerRequest.getPassword(),
                registerRequest.getEmail(),
                registerRequest.getFirstName(),
                registerRequest.getLastName(),
                Role.GUEST
        );
    }

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public User login(String username, String rawPassword) {
        Optional<User> userOptional = userDAO.findByEmailOrUsername(username);

        if (userOptional.isEmpty()) {
            logger.warn("Login failed: User '{}' not found.", username);
            return null;
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            logger.warn("Login failed: Incorrect password for user '{}'.", username);
            return null;
        }

        if (user instanceof iAuthenticatable) {
            ((iAuthenticatable) user).login();
        } else {
            logger.info("User {} accessed content.", user.getUsername());
        }

        logger.info("User {} logged in successfully with role: {}", user.getUsername(), user.getRole().name());
        return user;
    }

    public Member upgradeGuestToMember(String userId) {
        Optional<User> userOptional = userDAO.findById(userId);
        if (userOptional.isEmpty()) {
            logger.warn("Upgrade failed: User with ID '{}' not found.", userId);
            return null;
        }

        User user = userOptional.get();

        if (user.getRole() != Role.GUEST) {
            logger.warn("Upgrade failed: User '{}' is not a GUEST (current role: {}).", user.getUsername(), user.getRole().name());
            return null;
        }

        // Cập nhật vai trò
        user.setRole(Role.MEMBER);
        userDAO.save(user);

        logger.info("User {} (ID: {}) successfully upgraded to MEMBER.", user.getUsername(), user.getId());
        return (Member) user;
    }

    public User processGoogleLogin(String email, String firstName, String lastName, String googleId, String pictureUrl) {
        Optional<User> userOpt = userDAO.findByGoogleId(googleId);
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            logger.info("Existing Google user found: {} (ID: {})", user.getUsername(), user.getId());
            
            // Chỉ cập nhật nếu trường đó đang null/rỗng
            if (user.getFirstName() == null || user.getFirstName().isEmpty()) {
                user.setFirstName(firstName);
            }
            if (user.getLastName() == null || user.getLastName().isEmpty()) {
                user.setLastName(lastName);
            }
            if (user.getPictureUrl() == null || user.getPictureUrl().isEmpty()) {
                user.setPictureUrl(pictureUrl);
            }
            // Có thể cập nhật googleId/email nếu muốn
            user.setGoogleId(googleId);
            user.setEmail(email);
            userDAO.save(user);
            logger.info("Updated existing Google user: {}", user.getUsername());
        } else {
            // Tạo user mới từ Google info
            user = new GoogleUser(email, firstName, lastName, googleId, pictureUrl, AuthProvider.GOOGLE, Role.GUEST);
            userDAO.save(user);
            logger.info("Created new Google user: {} (ID: {})", user.getUsername(), user.getId());
        }
        return user;
    }

    public User changeUserRole(String userId, Role newRole) {
        Optional<User> userOptional = userDAO.findById(userId);

        if (userOptional.isEmpty()) {
            logger.warn("Change role failed: User with ID '{}' not found.", userId);
            return null;
        }

        User user = userOptional.get();

        if (user.getRole() == Role.GUEST && newRole != Role.MEMBER) {
            logger.warn("Change role failed: Cannot directly change GUEST to non-MEMBER role via this method.");
            return null;
        }

        user.setRole(newRole);
        User updatedUser = userDAO.save(user);

        logger.info("User '{}' (ID: {}) role changed to {}.", user.getUsername(), userId, newRole.name());
        return updatedUser;
    }
    public String generateJwtToken(User user) {
        return jwtUtil.generateToken(user);
    }
}