// src/main/java/com/loyaltyservice/dtos/RedeemPointsRequestDto.java
package com.loyaltyservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RedeemPointsRequestDto {
    private Long userId;
    private Integer points;
    private String description;
    private String referenceType; // e.g., "discount", "voucher"
    private Long referenceId;
}

