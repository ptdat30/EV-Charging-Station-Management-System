// FILE: UpdateSubscriptionRequestDto.java
package com.userservice.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UpdateSubscriptionRequestDto {
    private String packageType; // SILVER, GOLD, PLATINUM, or null to remove
    private LocalDateTime expiresAt; // Optional, if null will default to 30 days from now
}

