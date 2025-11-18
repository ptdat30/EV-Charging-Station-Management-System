// Guest.java
package com.quitsmoking.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@DiscriminatorValue("GUEST") // DiscriminatorValue khớp với Role.GUEST
@NoArgsConstructor
public class Guest extends User {

    // Constructor chung để tái tạo Guest từ dữ liệu hiện có (khi hạ cấp từ Member hoặc tải từ DB)
    // Constructor này quan trọng khi bạn cần khôi phục trạng thái Guest từ database
    public Guest(String id, String username, String password, String email, String firstName, String lastName,
                 String googleId, String pictureUrl, AuthProvider authProvider,
                 MembershipPlan  MemberShipPlan, LocalDate membershipEndDate) {
        super(id, username, password, email, firstName, lastName, googleId, pictureUrl,
              authProvider, Role.GUEST, MemberShipPlan, membershipEndDate, false);
        // Khi là Guest, gói thành viên sẽ là null, chúng ta set lại để đảm bảo
        this.setCurrentMembershipPlan(null);
        this.setMembershipEndDate(null);
    }

    // Constructor cho người dùng LOCAL Guest (đăng ký mới qua form local)
    public Guest(String username, String password, String email, String firstName, String lastName) {
        // ID sẽ được tạo tự động bởi @PrePersist trong lớp User
        super(username, password, email, firstName, lastName, Role.GUEST); // Gọi constructor của User
        this.setAuthProvider(AuthProvider.LOCAL);
        // MembershipPlan và MembershipEndDate sẽ là null theo mặc định
    }

    // Constructor cho Google Login (tạo Guest từ Google OAuth2)
    public Guest(String email, String firstName, String lastName,
                 String googleId, String pictureUrl, AuthProvider authProvider) {
        // ID sẽ được tạo tự động bởi @PrePersist trong lớp User
        super(email, firstName, lastName, googleId, pictureUrl, authProvider, Role.GUEST); // Gọi constructor của User
        // MembershipPlan và MembershipEndDate sẽ là null theo mặc định
    }

    @Override
    public void login() {
        System.out.println("Guest user login method executed: " + getUsername());
    }

    @Override
    public void updateProfile() {
        super.updateProfile();
        this.setUpdatedAt(LocalDateTime.now());
    }

    @Override
    public void displayDashboard() {
        System.out.println("Displaying dashboard for Guest: " + getUsername());
        System.out.println("Welcome, Guest! You can browse public content or register for full access.");
    }

    public void browsePublicContent() {
        System.out.println("Guest is Browse public content.");
    }
}