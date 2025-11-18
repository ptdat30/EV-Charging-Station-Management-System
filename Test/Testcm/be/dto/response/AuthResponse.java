package com.quitsmoking.dto.response;


import com.quitsmoking.model.User; 
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data // Tự động tạo getters, setters, equals, hashCode, toString
@NoArgsConstructor // Tạo constructor không đối số
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String userId;      
    private String username;    
    private String email;       
    private String role;        
    private String firstName;   
    private String lastName;    
    private String pictureUrl;
    private MembershipPlanResponse membership;
    private boolean freePlanClaimed;
    private LocalDate membershipEndDate;

    private String message; // Thông báo lỗi hoặc thông tin bổ sung

    public AuthResponse(String token, User user) {
        this.token = token;
        this.userId = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.pictureUrl = user.getPictureUrl();
        this.freePlanClaimed = user.isFreePlanClaimed();
        this.membershipEndDate = user.getMembershipEndDate();

        if (user.getCurrentMembershipPlan() != null) {
            this.membership = new MembershipPlanResponse(user.getCurrentMembershipPlan());
        } else {
            this.membership = null;
        }
        this.message = null;
    }
    public AuthResponse(User user) {
        this(null, user); // Gọi constructor trên với token là null
    }

    public AuthResponse(String message) {
        // Gọi constructor không đối số để khởi tạo các trường thành null/default
        this(); 
        this.message = message; // Chỉ đặt thông báo lỗi
    }
}