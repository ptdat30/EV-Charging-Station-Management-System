package com.quitsmoking.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@DiscriminatorValue("LOCAL_USER")
@NoArgsConstructor
public class LocalUser extends User {

    public LocalUser(String id, String username, String password, String email, String firstName, String lastName,
                     String googleId, String pictureUrl, AuthProvider authProvider,
                     MembershipPlan  MemberShipPlan, LocalDate membershipEndDate) {
        super(id, username, password, email, firstName, lastName, googleId, pictureUrl,
              authProvider, Role.GUEST, MemberShipPlan, membershipEndDate, false); // Đảm bảo role là Guest
        
    }

    /**
     * Constructor cho đăng ký người dùng local mới.
     * ID được tạo bởi @PrePersist trong lớp User.
     * Mật khẩu nên được mã hóa trước khi gọi constructor này hoặc trong service.
     */
    public LocalUser(String username, String password, String email,
                     String firstName, String lastName, Role role) {
        super(username, password, email, firstName, lastName, role); // Gọi constructor của User
        this.setAuthProvider(AuthProvider.LOCAL);
        // role của constructor này sẽ là LOCAL_USER
    }

    @Override
    public void login() {
        // Logic đăng nhập cho LocalUser
        System.out.println("LocalUser logged in: " + getUsername());
    }

    @Override
    public void updateProfile() {
        // Logic cập nhật hồ sơ cho LocalUser
        super.updateProfile();
        this.setUpdatedAt(LocalDateTime.now());
    }

    @Override
    public void displayDashboard() {
        // Logic hiển thị dashboard cho LocalUser
        System.out.println("Displaying dashboard for LocalUser: " + getUsername());
    }
}