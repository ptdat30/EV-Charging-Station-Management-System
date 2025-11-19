package com.quitsmoking.services;

import com.quitsmoking.model.AuthProvider;
import com.quitsmoking.model.GoogleUser; // Đảm bảo import GoogleUser
import com.quitsmoking.model.Role;       // Đảm bảo import Role
import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.UserDAO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Map;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    private final UserDAO userDAO;

    @Autowired
    public CustomOAuth2UserService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (OAuth2AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            logger.error("Error processing OAuth2 user: {}", ex.getMessage(), ex);
            OAuth2Error error = new OAuth2Error("oauth2_processing_error", "Error processing OAuth2 user: " + ex.getMessage(), null);
            throw new OAuth2AuthenticationException(error, ex);
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String providerId = oAuth2User.getName();

        if (!StringUtils.hasText(email)) {
            logger.error("Email not found from OAuth2 provider");
            OAuth2Error error = new OAuth2Error("missing_email", "Email not found from OAuth2 provider.", null);
            throw new OAuth2AuthenticationException(error);
        }

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider authProvider = AuthProvider.valueOf(registrationId.toUpperCase());

        Optional<User> userOptional = userDAO.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (user.getAuthProvider() != authProvider) {
                logger.warn("User with email {} already exists with provider {}. Attempted login with {}.",
                        email, user.getAuthProvider(), authProvider);
                String message = "You have already signed up with your " +
                        user.getAuthProvider() + " account. Please use your " +
                        user.getAuthProvider() + " account to login.";
                OAuth2Error error = new OAuth2Error("provider_mismatch", message, null);
                throw new OAuth2AuthenticationException(error);
            }
            user = updateExistingOAuth2User(user, attributes, providerId);
        } else {
            // Chỗ này có thể là nơi lỗi "User is abstract" xảy ra nếu bạn không dùng lớp con
            // Và cũng là nơi lỗi "cannot find symbol Role.USER" có thể xảy ra nếu defaultRole sai
            user = registerNewOAuth2User(attributes, authProvider, providerId);
        }

        userDAO.save(user);
        if (user instanceof OAuth2User) {
            return (OAuth2User) user;
        } else {
            // Điều này xảy ra nếu lớp User (hoặc lớp con của nó như GoogleUser) không implement OAuth2User
            // hoặc không được cấu hình đúng để trả về như một OAuth2User.
            // Bạn cần đảm bảo rằng lớp User của bạn (hoặc một wrapper) implement OAuth2User.
            logger.error("User object of type {} is not an instance of OAuth2User after processing.", user.getClass().getName());
            OAuth2Error error = new OAuth2Error("internal_server_error", "User principal could not be constructed as OAuth2User.", null);
            throw new OAuth2AuthenticationException(error, "User principal is not an instance of OAuth2User");
        }
    }

    private User updateExistingOAuth2User(User existingUser, Map<String, Object> attributes, String providerId) {
        existingUser.setFirstName((String) attributes.get("given_name"));
        existingUser.setLastName((String) attributes.get("family_name"));
        existingUser.setPictureUrl((String) attributes.get("picture"));
        if (existingUser.getAuthProvider() == AuthProvider.GOOGLE && StringUtils.hasText(providerId)) {
            existingUser.setGoogleId(providerId);
        }
        logger.info("Updated existing OAuth2 user: {}", existingUser.getEmail());
        return existingUser;
    }

    private User registerNewOAuth2User(Map<String, Object> attributes, AuthProvider authProvider, String providerId) {
        String email = (String) attributes.get("email");
        String firstName = (String) attributes.get("given_name");
        if (!StringUtils.hasText(firstName) && attributes.containsKey("name")) {
            String fullName = (String) attributes.get("name");
            String[] nameParts = fullName.split(" ", 2);
            firstName = nameParts[0];
        }
        String lastName = (String) attributes.get("family_name");
        if (!StringUtils.hasText(lastName) && attributes.containsKey("name")) {
            String fullName = (String) attributes.get("name");
            String[] nameParts = fullName.split(" ", 2);
            if (nameParts.length > 1) {
                lastName = nameParts[1];
            }
        }
        String pictureUrl = (String) attributes.get("picture");

        // QUAN TRỌNG: Kiểm tra enum Role của bạn. Lỗi nói rằng Role.USER không tồn tại.
        // Sử dụng một vai trò hợp lệ từ enum Role của bạn, ví dụ: Role.GUEST hoặc Role.MEMBER.
        Role defaultRole = Role.GUEST; // Hoặc Role.MEMBER, tùy thuộc vào định nghĩa enum Role của bạn.

        User newUser;
        if (authProvider == AuthProvider.GOOGLE) {
            // ✅ Khởi tạo chính xác GoogleUser (một lớp con cụ thể của User)
            newUser = new GoogleUser(email, firstName, lastName, providerId, pictureUrl, authProvider, defaultRole);
        } else {
            // Xử lý các nhà cung cấp khác hoặc ném lỗi nếu chỉ Google được hỗ trợ ở đây
            logger.warn("Unsupported OAuth2 provider for new user registration: {}", authProvider);
            OAuth2Error error = new OAuth2Error("unsupported_provider_registration", "Unsupported OAuth2 provider: " + authProvider, null);
            throw new OAuth2AuthenticationException(error, "Unsupported OAuth2 provider: " + authProvider);
        }

        // Username và password sẽ được xử lý bởi constructor của User/GoogleUser hoặc @PrePersist
        // Đảm bảo rằng username được đặt (ví dụ, từ email)
        if (!StringUtils.hasText(newUser.getUsername())) {
            newUser.setUsername(email);
        }
        // Password cho người dùng OAuth2 thường được để trống hoặc một giá trị giữ chỗ
        // Constructor User(String email, ...) đã đặt password = ""

        logger.info("Registered new OAuth2 user: {} with provider {}", email, authProvider);
        return newUser;
    }
}