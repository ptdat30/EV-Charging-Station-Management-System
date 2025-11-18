package com.quitsmoking.model;

// import com.quitsmoking.model.interfaces.iAuthenticatable;
// import com.quitsmoking.model.interfaces.iProfileManageable;
import com.quitsmoking.model.interfaces.iUserManageable;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.time.LocalDate; // Import LocalDate
import java.time.LocalDateTime;

@Entity
@DiscriminatorValue("ADMIN")
@NoArgsConstructor
public class Admin extends User implements iUserManageable {

    // Constructor chung để tái tạo Admin từ dữ liệu hiện có (bao gồm khi chuyển đổi)
    // Đây là constructor chính nên dùng khi chuyển đổi loại user hoặc tải từ DB
    public Admin(String id, String username, String password, String email, String firstName, String lastName,
                 String googleId, String pictureUrl, AuthProvider authProvider,
                 MembershipPlan  MemberShipPlan, LocalDate membershipEndDate) {
        super(id, username, password, email, firstName, lastName, googleId, pictureUrl,
              authProvider, Role.ADMIN, MemberShipPlan, membershipEndDate, false);
        // Admin thường không có gói thành viên, nên các trường này sẽ là null.
        // Tuy nhiên, việc truyền chúng vào là cần thiết để phù hợp với constructor của lớp cha User.
        this.setCurrentMembershipPlan(null); // Đảm bảo Admin không có gói thành viên
        this.setMembershipEndDate(null);
    }

    // Constructor cho Admin được tạo từ tài khoản local (có username/password) - Dành cho việc tạo mới
    public Admin(String username, String password, String email, String firstName, String lastName) {
        super(username, password, email, firstName, lastName, Role.ADMIN); // Gọi constructor của User
        this.setAuthProvider(AuthProvider.LOCAL); // Đảm bảo AuthProvider là LOCAL
        // MembershipPlan và MembershipEndDate sẽ là null theo mặc định
    }

    // Constructor cho Admin được nâng cấp từ tài khoản Google (hoặc tạo mới từ Google) - Dành cho việc tạo mới
    public Admin(String email, String firstName, String lastName,
                 String googleId, String pictureUrl, AuthProvider authProvider) {
        super(email, firstName, lastName, googleId, pictureUrl, authProvider, Role.ADMIN); // Gọi constructor của User
        // MembershipPlan và MembershipEndDate sẽ là null theo mặc định
    }

    @Override
    public void login() {
        System.out.println("Admin " + getUsername() + " has successfully logged in to the administration panel.");
    }

    // --- Triển khai phương thức từ iProfileManageable ---
    @Override
    public void displayDashboard() {
        System.out.println("Displaying admin dashboard for " + getUsername());
    }

    @Override
    public void updateProfile() {
        // Logic cập nhật hồ sơ cho Admin
        super.updateProfile();
        this.setUpdatedAt(LocalDateTime.now());
    }

    @Override
    public String toString() {
        return "Admin{" +
                "username='" + getUsername() + '\'' +
                ", email='" + getEmail() + '\'' +
                ", firstName='" + getFirstName() + '\'' +
                ", lastName='" + getLastName() + '\'' +
                ", role=" + getRole() +
                ", authProvider=" + getAuthProvider() +
                '}';
    }

    // --- Triển khai phương thức từ iUserManageable ---
    @Override
    public void viewUserDetails(String userId) {
        System.out.println("Admin " + getUsername() + " is viewing details for user ID: " + userId);
    }

    @Override
    public void updateUserDetails(String userId, User updatedUser) {
        System.out.println("Admin " + getUsername() + " is updating user ID: " + userId);
    }

    @Override
    public void deleteUser(String userId) {
        System.out.println("Admin " + getUsername() + " is deleting user ID: " + userId);
    }

    @Override
    public void resetUserPassword(String userId) {
        System.out.println("Admin " + getUsername() + " is resetting password for user ID: " + userId);
    }

    @Override
    public void banUser(String userId) {
        System.out.println("Admin " + getUsername() + " is banning user ID: " + userId);
    }

    @Override
    public User createUserAccount(String username, String rawPassword, String email, String firstName, String lastName, Role role) {
        System.out.println("Admin " + getUsername() + " is creating new user account with role: " + role);
        // 
        return null;
    }

    @Override
    public boolean changeUserRole(String userId, Role newRole) {
        System.out.println("Admin " + getUsername() + " is changing role for user ID: " + userId + " to " + newRole);
        // 
        return false;
    }
}