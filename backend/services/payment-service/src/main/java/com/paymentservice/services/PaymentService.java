// FILE: PaymentService.java
package com.paymentservice.services;

import com.paymentservice.dtos.PaymentResponseDto;
import com.paymentservice.dtos.ProcessPaymentRequestDto;

public interface PaymentService {
    PaymentResponseDto processPaymentForSession(ProcessPaymentRequestDto requestDto);
}