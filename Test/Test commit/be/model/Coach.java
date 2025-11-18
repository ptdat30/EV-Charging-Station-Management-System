package com.quitsmoking.model;

// import com.quitsmoking.model.interfaces.iAuthenticatable;
// import com.quitsmoking.model.interfaces.iProfileManageable;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.time.LocalDate; // Import LocalDate
import java.time.LocalDateTime;

@Entity
@DiscriminatorValue("COACH")
@NoArgsConstructor
public class Coach extends User {

    // Constructor chung để tái tạo Coach từ dữ liệu hiện có (bao gồm khi chuyển đổi)
    public Coach(String id, String username, String password, String email, String firstName, String lastName,
                 String googleId, String pictureUrl, AuthProvider authProvider,
                 MembershipPlan  MemberShipPlan, LocalDate membershipEndDate) {
        super(id, username, password, email, firstName, lastName, googleId, pictureUrl,
              authProvider, Role.COACH, MemberShipPlan, membershipEndDate, false);
        // Coach cũng thường không có gói thành viên riêng
        this.setCurrentMembershipPlan(null);
        this.setMembershipEndDate(null);
    }

    // Constructor cho Coach được tạo từ tài khoản local (có username/password) - Dành cho việc tạo mới
    public Coach(String username, String password, String email, String firstName, String lastName) {
        super(username, password, email, firstName, lastName, Role.COACH); // Gọi constructor của User
        this.setAuthProvider(AuthProvider.LOCAL);
    }

    // Constructor cho Coach được nâng cấp từ tài khoản Google (hoặc tạo mới từ Google) - Dành cho việc tạo mới
    public Coach(String email, String firstName, String lastName,
                 String googleId, String pictureUrl, AuthProvider authProvider) {
        super(email, firstName, lastName, googleId, pictureUrl, authProvider, Role.COACH); // Gọi constructor của User
    }

    @Override
    public void login() {
        System.out.println("Coach " + getUsername() + " has successfully logged in to their coaching portal.");
    }

    @Override
    public void displayDashboard() {
        System.out.println("--- Coach Dashboard ---");
        System.out.println("Welcome, Coach " + getFirstName() + " " + getLastName() + "!");
        System.out.println("- View assigned members' progress.");
        System.out.println("- Manage coaching sessions.");
        System.out.println("- Access coaching resources.");
        System.out.println("-------------------------");
    }

    @Override
    public void updateProfile() {
        // Logic cập nhật hồ sơ cho Coach
        super.updateProfile();
        this.setUpdatedAt(LocalDateTime.now());
    }

    // Các phương thức riêng của Coach
    public void viewMemberProgress(String memberId) {
        System.out.println("Coach " + getUsername() + " is viewing progress for member ID: " + memberId);
    }

    public void assignCourseToMember(String memberId, String courseId) {
        System.out.println("Coach " + getUsername() + " is assigning course " + courseId + " to member ID: " + memberId);
    }

    @Override
    public String toString() {
        return "Coach{" +
                "id='" + getId() + '\'' +
                ", username='" + getUsername() + '\'' +
                ", email='" + getEmail() + '\'' +
                ", firstName='" + getFirstName() + '\'' +
                ", lastName='" + getLastName() + '\'' +
                ", role=" + getRole() +
                ", authProvider=" + getAuthProvider() +
                '}';
    }
}