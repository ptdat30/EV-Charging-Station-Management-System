// FILE: PackageResponseDto.java
package com.userservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageResponseDto {
    private Long packageId;
    private String name;
    private String description;
    private String packageType; // SILVER, GOLD, PLATINUM
    private BigDecimal price;
    private Integer durationDays;
    private List<String> features;
    private Integer discountPercentage;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

