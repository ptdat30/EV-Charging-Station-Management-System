// FILE: PaymentController.java
package com.chargingservice.controllers;

import com.chargingservice.dtos.PaymentResponseDto;
import com.chargingservice.dtos.ProcessPaymentRequestDto;
import com.chargingservice.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // POST /api/payments/process
    @PostMapping("/process")
    public ResponseEntity<PaymentResponseDto> processPayment(@RequestBody ProcessPaymentRequestDto requestDto) {
        PaymentResponseDto response = paymentService.processPaymentForSession(requestDto);
        return ResponseEntity.ok(response);
    }
}