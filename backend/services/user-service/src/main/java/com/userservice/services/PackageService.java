// FILE: PackageService.java
package com.userservice.services;

import com.userservice.dtos.PurchasePackageRequestDto;
import com.userservice.dtos.UpdateSubscriptionRequestDto;
import com.userservice.dtos.UserResponseDto;

public interface PackageService {
    /**
     * Mua gói dịch vụ cho driver
     * @param userId ID của user
     * @param requestDto Thông tin gói cần mua
     * @return UserResponseDto với subscription đã được cập nhật
     */
    UserResponseDto purchasePackage(Long userId, PurchasePackageRequestDto requestDto);

    /**
     * Admin cập nhật subscription cho user
     * @param userId ID của user
     * @param requestDto Thông tin subscription mới
     * @return UserResponseDto với subscription đã được cập nhật
     */
    UserResponseDto updateUserSubscription(Long userId, UpdateSubscriptionRequestDto requestDto);
}

