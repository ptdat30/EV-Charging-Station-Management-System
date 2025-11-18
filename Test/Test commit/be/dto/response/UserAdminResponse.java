package com.quitsmoking.dto.response;

import com.quitsmoking.model.User;
import java.time.LocalDate;

public class UserAdminResponse {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String pictureUrl;
    private String phoneNumber;
    private String gender;
    private LocalDate dateOfBirth;
    private boolean freePlanClaimed;
    private LocalDate membershipStartDate;
    private LocalDate membershipEndDate;
    private String membershipPlanId;
    private String membershipPlanName;
    private boolean online;
    private String lastSeen;

    public UserAdminResponse(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.role = user.getRole() != null ? user.getRole().name() : null;
        this.pictureUrl = user.getPictureUrl();
        this.phoneNumber = user.getPhoneNumber();
        this.gender = user.getGender();
        this.dateOfBirth = user.getDateOfBirth();
        this.freePlanClaimed = user.isFreePlanClaimed();
        this.membershipStartDate = user.getMembershipStartDate();
        this.membershipEndDate = user.getMembershipEndDate();
        if (user.getCurrentMembershipPlan() != null) {
            this.membershipPlanId = user.getCurrentMembershipPlan().getId();
            this.membershipPlanName = user.getCurrentMembershipPlan().getPlanName();
        } else {
            this.membershipPlanId = null;
            this.membershipPlanName = null;
        }
        this.online = false;
        this.lastSeen = null;
    }

    // Getters và setters (có thể dùng Lombok nếu muốn)
    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getRole() { return role; }
    public String getPictureUrl() { return pictureUrl; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getGender() { return gender; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public boolean isFreePlanClaimed() { return freePlanClaimed; }
    public LocalDate getMembershipStartDate() { return membershipStartDate; }
    public LocalDate getMembershipEndDate() { return membershipEndDate; }
    public String getMembershipPlanId() { return membershipPlanId; }
    public String getMembershipPlanName() { return membershipPlanName; }
    public boolean isOnline() { return online; }
    public void setOnline(boolean online) { this.online = online; }
    public String getLastSeen() { return lastSeen; }
    public void setLastSeen(String lastSeen) { this.lastSeen = lastSeen; }
} 