// src/main/java/com/loyaltyservice/controllers/LoyaltyController.java
package com.loyaltyservice.controllers;

import com.loyaltyservice.dtos.LoyaltyAccountResponseDto;
import com.loyaltyservice.dtos.PointsTransactionResponseDto;
import com.loyaltyservice.dtos.RedeemPointsRequestDto;
import com.loyaltyservice.services.LoyaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    /**
     * Get loyalty account by user ID
     * GET /api/loyalty/account?userId={userId}
     */
    @GetMapping("/account")
    public ResponseEntity<LoyaltyAccountResponseDto> getAccountByUserId(@RequestParam Long userId) {
        try {
            LoyaltyAccountResponseDto account = loyaltyService.getAccountByUserId(userId);
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create new loyalty account
     * POST /api/loyalty/account
     */
    @PostMapping("/account")
    public ResponseEntity<LoyaltyAccountResponseDto> createAccount(@RequestBody Map<String, Long> request) {
        try {
            Long userId = request.get("userId");
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }
            LoyaltyAccountResponseDto account = loyaltyService.createAccount(userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(account);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get points transactions by user ID
     * GET /api/loyalty/transactions?userId={userId}
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<PointsTransactionResponseDto>> getTransactionsByUserId(@RequestParam Long userId) {
        try {
            List<PointsTransactionResponseDto> transactions = loyaltyService.getTransactionsByUserId(userId);
            return ResponseEntity.ok(transactions);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Redeem points
     * POST /api/loyalty/redeem
     */
    @PostMapping("/redeem")
    public ResponseEntity<LoyaltyAccountResponseDto> redeemPoints(@RequestBody RedeemPointsRequestDto request) {
        try {
            LoyaltyAccountResponseDto account = loyaltyService.redeemPoints(request);
            return ResponseEntity.ok(account);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "loyalty-service"));
    }
    
    /**
     * Recalculate and update tier level (admin/debug endpoint)
     * POST /api/loyalty/recalculate-tier?userId={userId}
     */
    @PostMapping("/recalculate-tier")
    public ResponseEntity<LoyaltyAccountResponseDto> recalculateTier(@RequestParam Long userId) {
        try {
            LoyaltyAccountResponseDto account = loyaltyService.recalculateTier(userId);
            return ResponseEntity.ok(account);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

