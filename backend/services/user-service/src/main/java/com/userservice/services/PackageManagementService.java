// FILE: PackageManagementService.java
package com.userservice.services;

import com.userservice.dtos.CreatePackageRequestDto;
import com.userservice.dtos.PackageResponseDto;
import com.userservice.dtos.UpdatePackageRequestDto;

import java.util.List;

public interface PackageManagementService {
    List<PackageResponseDto> getAllPackages();
    PackageResponseDto getPackageById(Long packageId);
    PackageResponseDto getPackageByType(String packageType);
    PackageResponseDto createPackage(CreatePackageRequestDto requestDto);
    PackageResponseDto updatePackage(Long packageId, UpdatePackageRequestDto requestDto);
    void deletePackage(Long packageId);
    PackageResponseDto togglePackageStatus(Long packageId, Boolean isActive);
    List<PackageResponseDto> getActivePackages();
}

