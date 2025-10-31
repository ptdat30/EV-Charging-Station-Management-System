// FILE: WalletController.java
package com.paymentservice.controllers;

import com.paymentservice.dtos.CreateWalletRequestDto;
import com.paymentservice.entities.Wallet;
import com.paymentservice.services.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    // POST /api/wallet
    @PostMapping("")
    public ResponseEntity<Wallet> createWallet(@RequestBody CreateWalletRequestDto requestDto) {
        Wallet createdWallet = walletService.createWallet(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdWallet);
    }

    // GET /api/wallet/balance
    @GetMapping("/balance")
    public ResponseEntity<java.util.Map<String, Object>> getBalance(@RequestHeader("X-User-Id") Long userId) {
        var wallet = walletService.getOrCreateWallet(userId);
        return ResponseEntity.ok(java.util.Map.of("balance", wallet.getBalance(), "currency", "VND"));
    }

    // POST /api/wallet/deposit
    @PostMapping("/deposit")
    public ResponseEntity<Wallet> deposit(@RequestHeader("X-User-Id") Long userId, @RequestParam("amount") java.math.BigDecimal amount) {
        return ResponseEntity.ok(walletService.deposit(userId, amount));
    }
}