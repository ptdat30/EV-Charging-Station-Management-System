// FILE: PaymentService.java
package com.paymentservice.services;

import com.paymentservice.dtos.PaymentResponseDto;
import com.paymentservice.dtos.ProcessDepositRequestDto;
import com.paymentservice.dtos.ProcessPaymentRequestDto;
import com.paymentservice.dtos.ProcessRefundRequestDto;

public interface PaymentService {
    PaymentResponseDto processPaymentForSession(ProcessPaymentRequestDto requestDto);
    PaymentResponseDto processDeposit(ProcessDepositRequestDto requestDto);
    PaymentResponseDto processRefund(ProcessRefundRequestDto requestDto);
}