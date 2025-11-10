// FILE: PackageController.java
package com.userservice.controllers;

import com.userservice.dtos.*;
import com.userservice.services.PackageManagementService;
import com.userservice.services.PackageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class PackageController {

    private static final Logger log = LoggerFactory.getLogger(PackageController.class);
    private final PackageService packageService;
    private final PackageManagementService packageManagementService;

    /**
     * Get all packages
     * GET /api/packages/getall
     */
    @GetMapping("/getall")
    public ResponseEntity<List<PackageResponseDto>> getAllPackages() {
        log.info("Fetching all packages");
        List<PackageResponseDto> packages = packageManagementService.getAllPackages();
        return ResponseEntity.ok(packages);
    }

    /**
     * Get active packages only
     * GET /api/packages/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<PackageResponseDto>> getActivePackages() {
        log.info("Fetching active packages");
        List<PackageResponseDto> packages = packageManagementService.getActivePackages();
        return ResponseEntity.ok(packages);
    }

    /**
     * Get package by ID
     * GET /api/packages/{packageId}
     */
    @GetMapping("/{packageId}")
    public ResponseEntity<PackageResponseDto> getPackageById(@PathVariable Long packageId) {
        log.info("Fetching package by ID: {}", packageId);
        PackageResponseDto pkg = packageManagementService.getPackageById(packageId);
        return ResponseEntity.ok(pkg);
    }

    /**
     * Get package by type
     * GET /api/packages/type/{packageType}
     */
    @GetMapping("/type/{packageType}")
    public ResponseEntity<PackageResponseDto> getPackageByType(@PathVariable String packageType) {
        log.info("Fetching package by type: {}", packageType);
        PackageResponseDto pkg = packageManagementService.getPackageByType(packageType);
        return ResponseEntity.ok(pkg);
    }

    /**
     * Create new package (Admin only)
     * POST /api/packages
     */
    @PostMapping
    public ResponseEntity<PackageResponseDto> createPackage(@RequestBody CreatePackageRequestDto requestDto) {
        log.info("Creating new package: {}", requestDto.getName());
        PackageResponseDto pkg = packageManagementService.createPackage(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(pkg);
    }

    /**
     * Update package (Admin only)
     * PUT /api/packages/{packageId}
     */
    @PutMapping("/{packageId}")
    public ResponseEntity<PackageResponseDto> updatePackage(
            @PathVariable Long packageId,
            @RequestBody UpdatePackageRequestDto requestDto) {
        log.info("Updating package: {}", packageId);
        PackageResponseDto pkg = packageManagementService.updatePackage(packageId, requestDto);
        return ResponseEntity.ok(pkg);
    }

    /**
     * Delete package (Admin only)
     * DELETE /api/packages/{packageId}
     */
    @DeleteMapping("/{packageId}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long packageId) {
        log.info("Deleting package: {}", packageId);
        packageManagementService.deletePackage(packageId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Toggle package status (Admin only)
     * PUT /api/packages/{packageId}/status
     */
    @PutMapping("/{packageId}/status")
    public ResponseEntity<PackageResponseDto> togglePackageStatus(
            @PathVariable Long packageId,
            @RequestBody Map<String, Boolean> request) {
        log.info("Toggling package status: {}", packageId);
        Boolean isActive = request.get("isActive");
        PackageResponseDto pkg = packageManagementService.togglePackageStatus(packageId, isActive);
        return ResponseEntity.ok(pkg);
    }

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

