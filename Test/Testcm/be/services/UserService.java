package com.quitsmoking.services;

import org.springframework.stereotype.Service;

import com.quitsmoking.model.User; // Class User của bạn
import com.quitsmoking.reponsitories.UserDAO; // Repository của bạn

import java.util.Optional;


@Service
public class UserService { 

    private final UserDAO userDAO;

    public UserService(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    /**
     * Lấy thông tin người dùng dựa trên ID của họ.
     *
     * @param userId ID của người dùng.
     * @return Đối tượng User nếu tìm thấy, hoặc null nếu không tìm thấy.
     */
    public User getUserById(String userId) {
        Optional<User> userOptional = userDAO.findById(userId);
        return userOptional.orElse(null);
    }

    /**
     * Tìm người dùng theo username.
     *
     * @param username Username của người dùng.
     * @return Đối tượng User nếu tìm thấy, hoặc null nếu không tìm thấy.
     */
    public User findByUsername(String username) {
        Optional<User> userOptional = userDAO.findByUsername(username);
        return userOptional.orElse(null);
    }

    /**
     * Tìm người dùng theo email.
     *
     * @param email Email của người dùng.
     * @return Đối tượng User nếu tìm thấy, hoặc null nếu không tìm thấy.
     */
    public User findByEmail(String email) {
        Optional<User> userOptional = userDAO.findByEmail(email);
        return userOptional.orElse(null);
    }


}