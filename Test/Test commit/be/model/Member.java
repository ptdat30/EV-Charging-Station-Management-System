package com.quitsmoking.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.time.LocalDate; // Import LocalDate
import java.time.LocalDateTime;

@Entity
@DiscriminatorValue("MEMBER")
@NoArgsConstructor
public class Member extends User {

    // Constructor chung để tái tạo Member từ dữ liệu hiện có (bao gồm khi chuyển đổi từ Guest)
    // Đây là constructor chính nên dùng khi chuyển đổi loại user hoặc tải từ DB
    public Member(String id, String username, String password, String email, String firstName, String lastName,
                  String googleId, String pictureUrl, AuthProvider authProvider,
                  MembershipPlan  MemberShipPlan, LocalDate membershipEndDate) {
        super(id, username, password, email, firstName, lastName, googleId, pictureUrl,
              authProvider, Role.MEMBER, MemberShipPlan, membershipEndDate, true);
        // Các trường MembershipPlan và membershipEndDate sẽ được truyền vào từ lớp cha
    }

    // Constructor khi nâng cấp từ Guest/GoogleUser lên Member (tạo mới Member từ User cũ)
    // Cần đảm bảo rằng các trường googleId và pictureUrl được truyền đúng cách
    // Phương thức này có thể được đơn giản hóa nếu bạn luôn dùng constructor trên
    public Member(String id, String username, String password, String email, String firstName, String lastName,
                  AuthProvider authProvider, String googleId, String pictureUrl) {
        // Gọi constructor chung của Member, truyền null cho gói thành viên ban đầu
        this(id, username, password, email, firstName, lastName, googleId, pictureUrl, authProvider, null, null);
    }

    // Constructor cho việc tạo Member từ một tài khoản local ban đầu (nếu có logic này)
    // Thường thì Member được tạo từ Guest sau khi đăng ký gói
    public Member(String username, String password, String email, String firstName, String lastName) {
        super(username, password, email, firstName, lastName, Role.MEMBER);
        this.setAuthProvider(AuthProvider.LOCAL);
    }


    @Override
    public void login() {
        // Logic đăng nhập cho Member
        System.out.println("Member logged in: " + getUsername());
    }

    @Override
    public void updateProfile() {
        // Logic cập nhật hồ sơ cho Member
        super.updateProfile();
        this.setUpdatedAt(LocalDateTime.now());
    }

    @Override
    public void displayDashboard() {
        // Logic hiển thị dashboard cho Member
        System.out.println("Displaying dashboard for Member: " + getUsername());
    }
}