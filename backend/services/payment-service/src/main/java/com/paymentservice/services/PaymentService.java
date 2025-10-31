// FILE: PaymentService.java
package com.paymentservice.services;

import com.paymentservice.dtos.PaymentResponseDto;
import com.paymentservice.dtos.ProcessDepositRequestDto;
import com.paymentservice.dtos.ProcessPaymentRequestDto;
import com.paymentservice.dtos.ProcessRefundRequestDto;
import com.paymentservice.dtos.RefundDepositRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PaymentService {
    PaymentResponseDto processPaymentForSession(ProcessPaymentRequestDto requestDto);
    PaymentResponseDto processDeposit(ProcessDepositRequestDto requestDto);
    PaymentResponseDto processRefund(ProcessRefundRequestDto requestDto);
    PaymentResponseDto refundDeposit(RefundDepositRequestDto requestDto);
    
    // Lấy danh sách payments của user
    List<PaymentResponseDto> getMyPayments(Long userId);
    Page<PaymentResponseDto> getMyPayments(Long userId, Pageable pageable);
}