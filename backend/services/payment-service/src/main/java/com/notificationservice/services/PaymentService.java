// FILE: PaymentService.java
package com.notificationservice.services;

import com.notificationservice.dtos.PaymentResponseDto;
import com.notificationservice.dtos.ProcessPaymentRequestDto;

public interface PaymentService {
    PaymentResponseDto processPaymentForSession(ProcessPaymentRequestDto requestDto);
}