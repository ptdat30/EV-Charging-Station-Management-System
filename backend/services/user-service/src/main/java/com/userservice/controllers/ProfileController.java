package com.userservice.controllers;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.userservice.entities.DriverProfile;
import com.userservice.entities.User;
import com.userservice.repositories.DriverProfileRepository;
import com.userservice.repositories.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class ProfileController {

    private static final Logger log = LoggerFactory.getLogger(ProfileController.class);

    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.userservice.services.FileStorageService fileStorageService;

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getMyProfile(@RequestHeader("X-User-Id") Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        DriverProfile profile = driverProfileRepository.findByUserId(userId)
                .orElseGet(() -> ensureProfile(user));

        ProfileResponse response = new ProfileResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setAddress(profile.getAddress());
        response.setEmergencyContact(profile.getEmergencyContact());
        response.setPreferredPaymentMethod(profile.getPreferredPaymentMethod());
        response.setAvatarUrl(user.getAvatarUrl());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateMyProfile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody UpdateProfileRequest request
    ) {
        User user = userRepository.findById(userId).orElseThrow();
        DriverProfile profile = driverProfileRepository.findByUserId(userId)
                .orElseGet(() -> ensureProfile(user));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getEmergencyContact() != null) profile.setEmergencyContact(request.getEmergencyContact());
        if (request.getPreferredPaymentMethod() != null) profile.setPreferredPaymentMethod(request.getPreferredPaymentMethod());

        userRepository.save(user);
        driverProfileRepository.save(profile);

        ProfileResponse response = new ProfileResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setAddress(profile.getAddress());
        response.setEmergencyContact(profile.getEmergencyContact());
        response.setPreferredPaymentMethod(profile.getPreferredPaymentMethod());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody ChangePasswordRequest request
    ) {
        User user = userRepository.findById(userId).orElseThrow();
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu mới tối thiểu 6 ký tự"));
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("message", "Mật khẩu hiện tại không đúng"));
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }

    // --- VEHICLES ---
    @GetMapping("/vehicles")
    public ResponseEntity<List<VehicleDto>> getVehicles(@RequestHeader("X-User-Id") Long userId) {
        DriverProfile profile = driverProfileRepository.findByUserId(userId)
                .orElseGet(() -> ensureProfile(userRepository.findById(userId).orElseThrow()));
        List<VehicleDto> vehicles = readVehicles(profile);
        return ResponseEntity.ok(vehicles);
    }

    @PostMapping("/vehicles")
    public ResponseEntity<VehicleDto> addVehicle(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody VehicleDto request
    ) {
        DriverProfile profile = driverProfileRepository.findByUserId(userId)
                .orElseGet(() -> ensureProfile(userRepository.findById(userId).orElseThrow()));
        List<VehicleDto> vehicles = readVehicles(profile);
        long newId = vehicles.stream().mapToLong(v -> v.getId() != null ? v.getId() : 0L).max().orElse(0L) + 1;
        request.setId(newId);
        if (request.getIsDefault() == null) request.setIsDefault(false);
        if (request.getIsDefault()) {
            vehicles.forEach(v -> v.setIsDefault(false));
        }
        vehicles.add(request);
        writeVehicles(profile, vehicles);
        driverProfileRepository.save(profile);
        return ResponseEntity.ok(request);
    }

    @PutMapping("/vehicles/{id}")
    public ResponseEntity<VehicleDto> updateVehicle(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @RequestBody VehicleDto request
    ) {
        DriverProfile profile = driverProfileRepository.findByUserId(userId)
                .orElseGet(() -> ensureProfile(userRepository.findById(userId).orElseThrow()));
        List<VehicleDto> vehicles = readVehicles(profile);
        Optional<VehicleDto> existingOpt = vehicles.stream().filter(v -> Objects.equals(v.getId(), id)).findFirst();
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        VehicleDto existing = existingOpt.get();
        if (request.getName() != null) existing.setName(request.getName());
        if (request.getPlateNumber() != null) existing.setPlateNumber(request.getPlateNumber());
        if (request.getBatteryCapacityKwh() != null) existing.setBatteryCapacityKwh(request.getBatteryCapacityKwh());
        if (request.getPreferredChargerType() != null) existing.setPreferredChargerType(request.getPreferredChargerType());
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            vehicles.forEach(v -> v.setIsDefault(false));
            existing.setIsDefault(true);
        }
        writeVehicles(profile, vehicles);
        driverProfileRepository.save(profile);
        return ResponseEntity.ok(existing);
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<Void> deleteVehicle(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id
    ) {
        DriverProfile profile = driverProfileRepository.findByUserId(userId)
                .orElseGet(() -> ensureProfile(userRepository.findById(userId).orElseThrow()));
        List<VehicleDto> vehicles = readVehicles(profile);
        vehicles.removeIf(v -> Objects.equals(v.getId(), id));
        writeVehicles(profile, vehicles);
        driverProfileRepository.save(profile);
        return ResponseEntity.noContent().build();
    }

    private DriverProfile ensureProfile(User user) {
        DriverProfile profile = new DriverProfile();
        profile.setUser(user);
        profile.setVehicleInfo("[]");
        return driverProfileRepository.save(profile);
    }

    private List<VehicleDto> readVehicles(DriverProfile profile) {
        try {
            String json = profile.getVehicleInfo();
            if (json == null || json.isBlank()) return new ArrayList<>();
            return objectMapper.readValue(json, new TypeReference<List<VehicleDto>>(){});
        } catch (Exception e) {
            log.warn("Failed to parse vehicleInfo JSON, resetting. Error: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private void writeVehicles(DriverProfile profile, List<VehicleDto> vehicles) {
        try {
            profile.setVehicleInfo(objectMapper.writeValueAsString(vehicles));
        } catch (Exception e) {
            throw new RuntimeException("Failed to write vehicle info", e);
        }
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<Map<String, String>> uploadAvatar(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam("file") MultipartFile file) {
        log.info("Uploading avatar for user {}", userId);
        
        // Check if storage service is available
        if (fileStorageService == null) {
            log.error("FileStorageService is not available - Cloudinary not configured");
            return ResponseEntity.status(503).body(Map.of(
                "error", "Avatar upload is not available. Please configure Cloudinary in application.yml"
            ));
        }
        
        try {
            User user = userRepository.findById(userId).orElseThrow();
            
            // Delete old avatar if exists
            if (user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank()) {
                try {
                    fileStorageService.deleteAvatar(user.getAvatarUrl());
                } catch (Exception e) {
                    log.warn("Failed to delete old avatar: {}", e.getMessage());
                }
            }
            
            // Upload new avatar
            String avatarUrl = fileStorageService.uploadAvatar(file, userId);
            
            // Update user
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
            
            log.info("Avatar uploaded successfully for user {}", userId);
            return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid avatar upload request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            log.error("Storage service error: {}", e.getMessage());
            return ResponseEntity.status(503).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to upload avatar for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload avatar"));
        }
    }
    
    @DeleteMapping("/profile/avatar")
    public ResponseEntity<Map<String, String>> deleteAvatar(@RequestHeader("X-User-Id") Long userId) {
        log.info("Deleting avatar for user {}", userId);
        
        // Check if storage service is available
        if (fileStorageService == null) {
            log.error("FileStorageService is not available - Cloudinary not configured");
            return ResponseEntity.status(503).body(Map.of(
                "error", "Avatar service is not available"
            ));
        }
        
        try {
            User user = userRepository.findById(userId).orElseThrow();
            
            if (user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank()) {
                fileStorageService.deleteAvatar(user.getAvatarUrl());
                user.setAvatarUrl(null);
                userRepository.save(user);
                log.info("Avatar deleted successfully for user {}", userId);
            }
            
            return ResponseEntity.ok(Map.of("message", "Avatar deleted successfully"));
            
        } catch (Exception e) {
            log.error("Failed to delete avatar for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to delete avatar"));
        }
    }

    @Data
    public static class ProfileResponse {
        private Long userId;
        private String email;
        private String fullName;
        private String phone;
        private String address;
        private String emergencyContact;
        private String preferredPaymentMethod;
        private String avatarUrl;
    }

    @Data
    public static class UpdateProfileRequest {
        private String fullName;
        private String phone;
        private String address;
        private String emergencyContact;
        private String preferredPaymentMethod;
    }

    @Data
    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
    }

    @Data
    public static class VehicleDto {
        private Long id;
        private String name;
        private String plateNumber;
        private Double batteryCapacityKwh;
        private String preferredChargerType;
        private Boolean isDefault;
    }
}


