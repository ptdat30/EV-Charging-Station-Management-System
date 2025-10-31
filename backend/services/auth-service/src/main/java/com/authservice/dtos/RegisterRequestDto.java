package com.authservice.dtos;

import lombok.Data;

@Data
public class RegisterRequestDto {
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private String userType; // driver/staff/admin
}


