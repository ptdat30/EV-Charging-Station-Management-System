// FILE: UserDetailDto.java (in auth-service)
package com.authservice.dtos.internal;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class UserDetailDto {
    private Long userId;
    private String email;
    private String passwordHash; // Quan trọng: Cần lấy password đã mã hóa
    private String fullName;
    private String avatarUrl;
    private UserType userType;
    private Status status;
    private SubscriptionPackage subscriptionPackage;
    private LocalDateTime subscriptionExpiresAt;

    // Các enum này phải khớp với User entity bên user-service
    public enum UserType { driver, staff, admin }
    public enum Status { active, inactive, suspended, deleted }
    public enum SubscriptionPackage { SILVER, GOLD, PLATINUM }
}