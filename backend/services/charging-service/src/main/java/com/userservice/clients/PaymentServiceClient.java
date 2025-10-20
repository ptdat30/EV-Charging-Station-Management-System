// FILE: PaymentServiceClient.java (trong charging-service)
package com.userservice.clients;

import com.userservice.dtos.internal.PaymentResponseDto;
import com.userservice.dtos.internal.ProcessPaymentRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// [COMMAND]: Định nghĩa client để gọi đến PAYMENT-SERVICE
@FeignClient(name = "PAYMENT-SERVICE")
public interface PaymentServiceClient {

    // [COMMAND]: Khai báo phương thức khớp với endpoint bên payment-service
    // POST /api/payments/process
    @PostMapping("/api/payments/process")
    PaymentResponseDto processPayment(@RequestBody ProcessPaymentRequestDto requestDto);
}