// FILE: UpdatePackageRequestDto.java
package com.userservice.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePackageRequestDto {
    private String name;
    private String description;
    private BigDecimal price;
    private Integer durationDays;
    private List<String> features;
    private Integer discountPercentage;
    private Boolean isActive;
}

