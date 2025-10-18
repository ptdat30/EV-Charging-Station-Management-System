// FILE: PaymentService.java
package com.chargingservice.services;

import com.chargingservice.dtos.PaymentResponseDto;
import com.chargingservice.dtos.ProcessPaymentRequestDto;

public interface PaymentService {
    PaymentResponseDto processPaymentForSession(ProcessPaymentRequestDto requestDto);
}