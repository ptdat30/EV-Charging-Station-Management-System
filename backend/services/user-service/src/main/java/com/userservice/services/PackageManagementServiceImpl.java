// FILE: PackageManagementServiceImpl.java
package com.userservice.services;

import com.userservice.dtos.CreatePackageRequestDto;
import com.userservice.dtos.PackageResponseDto;
import com.userservice.dtos.UpdatePackageRequestDto;
import com.userservice.entities.Package;
import com.userservice.exceptions.ResourceNotFoundException;
import com.userservice.repositories.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageManagementServiceImpl implements PackageManagementService {

    private static final Logger log = LoggerFactory.getLogger(PackageManagementServiceImpl.class);
    private final PackageRepository packageRepository;

    @Override
    public List<PackageResponseDto> getAllPackages() {
        log.info("Fetching all packages");
        List<Package> packages = packageRepository.findAll();
        return packages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public PackageResponseDto getPackageById(Long packageId) {
        log.info("Fetching package by ID: {}", packageId);
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + packageId));
        return convertToDto(pkg);
    }

    @Override
    public PackageResponseDto getPackageByType(String packageType) {
        log.info("Fetching package by type: {}", packageType);
        Package.PackageType type;
        try {
            type = Package.PackageType.valueOf(packageType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid package type: " + packageType);
        }
        
        Package pkg = packageRepository.findByPackageType(type)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with type: " + packageType));
        return convertToDto(pkg);
    }

    @Override
    @Transactional
    public PackageResponseDto createPackage(CreatePackageRequestDto requestDto) {
        log.info("Creating new package: {}", requestDto.getName());
        
        // Validate package type
        Package.PackageType packageType;
        try {
            packageType = Package.PackageType.valueOf(requestDto.getPackageType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid package type: " + requestDto.getPackageType());
        }
        
        // Check if package type already exists
        if (packageRepository.findByPackageType(packageType).isPresent()) {
            throw new RuntimeException("Package with type " + packageType + " already exists");
        }
        
        Package pkg = new Package();
        pkg.setName(requestDto.getName());
        pkg.setDescription(requestDto.getDescription());
        pkg.setPackageType(packageType);
        pkg.setPrice(requestDto.getPrice());
        pkg.setDurationDays(requestDto.getDurationDays());
        pkg.setFeatures(requestDto.getFeatures());
        pkg.setDiscountPercentage(requestDto.getDiscountPercentage());
        pkg.setIsActive(requestDto.getIsActive() != null ? requestDto.getIsActive() : true);
        
        Package savedPackage = packageRepository.save(pkg);
        log.info("Package created successfully with ID: {}", savedPackage.getPackageId());
        
        return convertToDto(savedPackage);
    }

    @Override
    @Transactional
    public PackageResponseDto updatePackage(Long packageId, UpdatePackageRequestDto requestDto) {
        log.info("Updating package: {}", packageId);
        
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + packageId));
        
        if (requestDto.getName() != null) {
            pkg.setName(requestDto.getName());
        }
        if (requestDto.getDescription() != null) {
            pkg.setDescription(requestDto.getDescription());
        }
        if (requestDto.getPrice() != null) {
            pkg.setPrice(requestDto.getPrice());
        }
        if (requestDto.getDurationDays() != null) {
            pkg.setDurationDays(requestDto.getDurationDays());
        }
        if (requestDto.getFeatures() != null) {
            pkg.setFeatures(requestDto.getFeatures());
        }
        if (requestDto.getDiscountPercentage() != null) {
            pkg.setDiscountPercentage(requestDto.getDiscountPercentage());
        }
        if (requestDto.getIsActive() != null) {
            pkg.setIsActive(requestDto.getIsActive());
        }
        
        Package updatedPackage = packageRepository.save(pkg);
        log.info("Package updated successfully: {}", packageId);
        
        return convertToDto(updatedPackage);
    }

    @Override
    @Transactional
    public void deletePackage(Long packageId) {
        log.info("Deleting package: {}", packageId);
        
        if (!packageRepository.existsById(packageId)) {
            throw new ResourceNotFoundException("Package not found with id: " + packageId);
        }
        
        packageRepository.deleteById(packageId);
        log.info("Package deleted successfully: {}", packageId);
    }

    @Override
    @Transactional
    public PackageResponseDto togglePackageStatus(Long packageId, Boolean isActive) {
        log.info("Toggling package status: {} to {}", packageId, isActive);
        
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + packageId));
        
        pkg.setIsActive(isActive);
        Package updatedPackage = packageRepository.save(pkg);
        
        log.info("Package status updated successfully: {}", packageId);
        return convertToDto(updatedPackage);
    }

    @Override
    public List<PackageResponseDto> getActivePackages() {
        log.info("Fetching active packages");
        List<Package> packages = packageRepository.findByIsActive(true);
        return packages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private PackageResponseDto convertToDto(Package pkg) {
        PackageResponseDto dto = new PackageResponseDto();
        dto.setPackageId(pkg.getPackageId());
        dto.setName(pkg.getName());
        dto.setDescription(pkg.getDescription());
        dto.setPackageType(pkg.getPackageType().name());
        dto.setPrice(pkg.getPrice());
        dto.setDurationDays(pkg.getDurationDays());
        dto.setFeatures(pkg.getFeatures());
        dto.setDiscountPercentage(pkg.getDiscountPercentage());
        dto.setIsActive(pkg.getIsActive());
        dto.setCreatedAt(pkg.getCreatedAt());
        dto.setUpdatedAt(pkg.getUpdatedAt());
        return dto;
    }
}

