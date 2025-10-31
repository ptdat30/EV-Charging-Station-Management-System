// FILE: AuthService.java
package com.authservice.services;

import com.authservice.dtos.LoginRequestDto;
import com.authservice.dtos.LoginResponseDto;
import com.authservice.dtos.RegisterRequestDto;

public interface AuthService {
    LoginResponseDto login(LoginRequestDto loginRequestDto);
    Object register(RegisterRequestDto registerRequestDto);
}