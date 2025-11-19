package com.quitsmoking.services;

import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.UserDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;
import java.util.UUID;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    private final UserDAO userDAO;

    @Autowired
    public CustomUserDetailsService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // Ưu tiên tìm theo username trước (local user)
        Optional<User> userOptional = userDAO.findByUsername(identifier);
        if (userOptional.isEmpty()) {
            // Nếu không có, thử tìm theo email (Google user)
            userOptional = userDAO.findByEmail(identifier);
        }
        if (userOptional.isEmpty()) {
            // Nếu không có, thử tìm theo UUID (nếu cần)
            if (isValidUUID(identifier)) {
                userOptional = userDAO.findByIdWithMembership(identifier);
            }
        }
        User user = userOptional.orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));
        logger.info("CustomUserDetailsService: Successfully loaded user details for '{}'. User ID: {}, Role: {}", identifier, user.getId(), user.getRole().name());
        return user;
    }

    // Hàm kiểm tra xem một chuỗi có phải là UUID hợp lệ hay không
    private boolean isValidUUID(String str) {
        try {
            UUID.fromString(str);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}