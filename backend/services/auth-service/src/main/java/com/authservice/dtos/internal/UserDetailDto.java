// FILE: UserDetailDto.java (in auth-service)
package com.authservice.dtos.internal;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserDetailDto {
    private Long userId;
    private String email;
    private String passwordHash; // Quan trọng: Cần lấy password đã mã hóa
    private UserType userType;
    private Status status;

    // Các enum này phải khớp với User entity bên user-service
    public enum UserType { driver, staff, admin }
    public enum Status { active, inactive, suspended, deleted }
}