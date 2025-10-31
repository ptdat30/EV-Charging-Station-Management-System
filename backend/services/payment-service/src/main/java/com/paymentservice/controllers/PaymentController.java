// FILE: PaymentController.java
package com.paymentservice.controllers;

import com.paymentservice.dtos.PaymentResponseDto;
import com.paymentservice.dtos.ProcessDepositRequestDto;
import com.paymentservice.dtos.ProcessPaymentRequestDto;
import com.paymentservice.dtos.ProcessRefundRequestDto;
import com.paymentservice.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<PaymentResponseDto> processPayment(@RequestBody ProcessPaymentRequestDto requestDto) {
        PaymentResponseDto response = paymentService.processPaymentForSession(requestDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/deposit")
    public ResponseEntity<PaymentResponseDto> processDeposit(@RequestBody ProcessDepositRequestDto requestDto) {
        PaymentResponseDto response = paymentService.processDeposit(requestDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refund")
    public ResponseEntity<PaymentResponseDto> processRefund(@RequestBody ProcessRefundRequestDto requestDto) {
        PaymentResponseDto response = paymentService.processRefund(requestDto);
        return ResponseEntity.ok(response);
    }
}