// FILE: PaymentService.java
package com.userservice.services;

import com.userservice.dtos.PaymentResponseDto;
import com.userservice.dtos.ProcessPaymentRequestDto;

public interface PaymentService {
    PaymentResponseDto processPaymentForSession(ProcessPaymentRequestDto requestDto);
}