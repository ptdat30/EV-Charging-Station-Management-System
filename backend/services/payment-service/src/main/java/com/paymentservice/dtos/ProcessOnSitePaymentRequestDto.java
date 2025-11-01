// FILE: ProcessOnSitePaymentRequestDto.java
package com.paymentservice.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProcessOnSitePaymentRequestDto {
    private Long sessionId;
    private Long userId;
    private BigDecimal amount;
    private String paymentMethod; // cash, qr_payment, e_wallet, etc.
}

