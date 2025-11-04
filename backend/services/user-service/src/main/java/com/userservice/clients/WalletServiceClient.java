// FILE: WalletServiceClient.java
package com.userservice.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.util.Map;

@FeignClient(name = "PAYMENT-SERVICE")
public interface WalletServiceClient {
    
    @GetMapping("/api/wallet/balance")
    Map<String, Object> getBalance(@RequestHeader("X-User-Id") Long userId);

    @PostMapping("/api/wallet/deduct")
    Map<String, Object> deduct(@RequestHeader("X-User-Id") Long userId, @RequestParam("amount") BigDecimal amount);
}

