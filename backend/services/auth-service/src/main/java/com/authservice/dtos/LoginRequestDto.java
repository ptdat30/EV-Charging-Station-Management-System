package com.authservice.dtos;

import lombok.Data;

@Data
public class LoginRequestDto {
    private String email;
    private String password; // Plain text password entered by user
}