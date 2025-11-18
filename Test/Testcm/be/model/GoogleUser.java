package com.quitsmoking.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@DiscriminatorValue("GOOGLE_USER")
@NoArgsConstructor
public class GoogleUser extends User {

    // Constructor cho người dùng Google mới
    public GoogleUser(String email, String firstName, String lastName,
                      String googleId, String pictureUrl, AuthProvider authProvider, Role role) {
        super(email, firstName, lastName, googleId, pictureUrl, authProvider, role);
    }

    @Override
    public void login() {
        // Logic đăng nhập cho GoogleUser
        System.out.println("GoogleUser logged in: " + getUsername());
    }

    @Override
    public void updateProfile() {
        // Logic cập nhật hồ sơ cho GoogleUser
        super.updateProfile();
        this.setUpdatedAt(LocalDateTime.now());
    }

    @Override
    public void displayDashboard() {
        // Logic hiển thị dashboard cho GoogleUser
        System.out.println("Displaying dashboard for GoogleUser: " + getUsername());
    }
}