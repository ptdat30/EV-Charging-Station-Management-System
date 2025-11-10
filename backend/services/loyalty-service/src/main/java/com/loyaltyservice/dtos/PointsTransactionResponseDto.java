// src/main/java/com/loyaltyservice/dtos/PointsTransactionResponseDto.java
package com.loyaltyservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PointsTransactionResponseDto {
    private Long transactionId;
    private Long accountId;
    private Integer points;
    private String transactionType; // earn, redeem, expire, bonus, adjustment, refund
    private Integer balanceAfter;
    private String referenceType;
    private Long referenceId;
    private String description;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}

