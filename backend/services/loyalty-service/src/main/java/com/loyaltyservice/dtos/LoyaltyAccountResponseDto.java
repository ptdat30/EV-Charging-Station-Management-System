// src/main/java/com/loyaltyservice/dtos/LoyaltyAccountResponseDto.java
package com.loyaltyservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyAccountResponseDto {
    private Long accountId;
    private Long userId;
    private Integer pointsBalance;
    private Integer lifetimePoints;
    private String tierLevel; // bronze, silver, gold, platinum, diamond
    private Integer tierProgress;
    private LocalDateTime tierUpdatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Helper fields for frontend
    private String tierDisplayName;
    private Integer pointsToNextTier;
    private String nextTierLevel;
}

