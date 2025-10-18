// FILE: CreateWalletRequestDto.java
package com.chargingservice.dtos;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateWalletRequestDto {
    private Long userId; // ID của người dùng cần tạo ví
    private BigDecimal initialBalance = BigDecimal.ZERO; // Số dư ban đầu (mặc định là 0)
}