// FILE: AuthService.java
package com.authservice.services;

import com.authservice.dtos.LoginRequestDto;
import com.authservice.dtos.LoginResponseDto;

public interface AuthService {
    LoginResponseDto login(LoginRequestDto loginRequestDto);
}