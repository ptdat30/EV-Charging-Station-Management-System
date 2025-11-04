// FILE: PackageController.java
package com.userservice.controllers;

import com.userservice.dtos.PurchasePackageRequestDto;
import com.userservice.dtos.UpdateSubscriptionRequestDto;
import com.userservice.dtos.UserResponseDto;
import com.userservice.services.PackageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class PackageController {

    private static final Logger log = LoggerFactory.getLogger(PackageController.class);
    private final PackageService packageService;

    /**
     * Driver mua gói dịch vụ
     * POST /api/packages/purchase
     */
    @PostMapping("/purchase")
    public ResponseEntity<UserResponseDto> purchasePackage(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody PurchasePackageRequestDto requestDto) {
        log.info("Received package purchase request - userId: {}, packageType: {}", userId, requestDto.getPackageType());
        UserResponseDto user = packageService.purchasePackage(userId, requestDto);
        return ResponseEntity.ok(user);
    }

    /**
     * Admin cập nhật subscription cho user
     * PUT /api/packages/subscription/{userId}
     */
    @PutMapping("/subscription/{userId}")
    public ResponseEntity<UserResponseDto> updateUserSubscription(
            @PathVariable Long userId,
            @RequestBody UpdateSubscriptionRequestDto requestDto) {
        log.info("Admin updating subscription - userId: {}, packageType: {}", userId, requestDto.getPackageType());
        UserResponseDto user = packageService.updateUserSubscription(userId, requestDto);
        return ResponseEntity.ok(user);
    }
}

