// FILE: UserDetailDto.java (trong user-service)
package com.userservice.dtos;

import com.userservice.entities.User;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserDetailDto {
    private Long userId;
    private String email;
    private String passwordHash; // Bao gồm password hash
    private User.UserType userType;
    private User.Status status;
}