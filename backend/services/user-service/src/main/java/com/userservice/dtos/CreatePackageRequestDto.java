// FILE: CreatePackageRequestDto.java
package com.userservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePackageRequestDto {
    private String name;
    private String description;
    private String packageType; // SILVER, GOLD, PLATINUM
    private BigDecimal price;
    private Integer durationDays;
    private List<String> features;
    private Integer discountPercentage;
    private Boolean isActive;
}

