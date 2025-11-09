package com.userservice.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {
    
    private static final Logger log = LoggerFactory.getLogger(FileStorageServiceImpl.class);
    
    @Autowired(required = false)
    private Cloudinary cloudinary;
    
    @Value("${cloudinary.enabled:false}")
    private boolean cloudinaryEnabled;
    
    @Override
    public String uploadAvatar(MultipartFile file, Long userId) throws Exception {
        log.info("=== UPLOAD AVATAR DEBUG ===");
        log.info("Cloudinary enabled: {}", cloudinaryEnabled);
        log.info("Cloudinary bean is null: {}", cloudinary == null);
        
        if (!cloudinaryEnabled || cloudinary == null) {
            log.error("Cloudinary is not configured - enabled: {}, bean null: {}", cloudinaryEnabled, cloudinary == null);
            throw new IllegalStateException("Cloudinary is not configured");
        }
        
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        // Validate file type
        String contentType = file.getContentType();
        log.info("File content type: {}", contentType);
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }
        
        // Validate file size (max 5MB)
        log.info("File size: {} bytes", file.getSize());
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must be less than 5MB");
        }
        
        try {
            log.info("Starting Cloudinary upload for user {}", userId);
            
            // Upload to Cloudinary with options
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "avatars/" + userId,  // Organize by user ID
                "public_id", UUID.randomUUID().toString(),  // Unique ID
                "resource_type", "image",
                "overwrite", false
            ));
            
            // Get secure URL
            String secureUrl = (String) uploadResult.get("secure_url");
            
            log.info("✅ Successfully uploaded avatar for user {} to Cloudinary", userId);
            log.info("Avatar URL: {}", secureUrl);
            
            return secureUrl;
            
        } catch (Exception e) {
            log.error("❌ Cloudinary upload failed for user {}", userId);
            log.error("Error class: {}", e.getClass().getName());
            log.error("Error message: {}", e.getMessage());
            log.error("Stack trace:", e);
            throw new Exception("Failed to upload avatar: " + e.getMessage());
        }
    }
    
    @Override
    public String uploadAvatar(Long userId, MultipartFile file, String folderPrefix) throws Exception {
        log.info("=== UPLOAD IMAGE DEBUG ===");
        log.info("Folder prefix: {}", folderPrefix);
        log.info("Cloudinary enabled: {}", cloudinaryEnabled);
        log.info("Cloudinary bean is null: {}", cloudinary == null);
        
        if (!cloudinaryEnabled || cloudinary == null) {
            log.error("Cloudinary is not configured - enabled: {}, bean null: {}", cloudinaryEnabled, cloudinary == null);
            throw new IllegalStateException("Cloudinary is not configured");
        }
        
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        // Validate file type
        String contentType = file.getContentType();
        log.info("File content type: {}", contentType);
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }
        
        // Validate file size (max 5MB)
        log.info("File size: {} bytes", file.getSize());
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must be less than 5MB");
        }
        
        try {
            log.info("Starting Cloudinary upload for user {} to folder {}", userId, folderPrefix);
            
            // Upload to Cloudinary with options
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folderPrefix + "/" + userId,  // e.g., "vehicles/123"
                "public_id", UUID.randomUUID().toString(),
                "resource_type", "image",
                "overwrite", false
            ));
            
            // Get secure URL
            String secureUrl = (String) uploadResult.get("secure_url");
            
            log.info("✅ Successfully uploaded image for user {} to Cloudinary", userId);
            log.info("Image URL: {}", secureUrl);
            
            return secureUrl;
            
        } catch (Exception e) {
            log.error("❌ Cloudinary upload failed for user {}", userId);
            log.error("Error class: {}", e.getClass().getName());
            log.error("Error message: {}", e.getMessage());
            log.error("Stack trace:", e);
            throw new Exception("Failed to upload image: " + e.getMessage());
        }
    }
    
    @Override
    public void deleteAvatar(String imageUrl) {
        if (!cloudinaryEnabled || cloudinary == null) {
            log.warn("Cloudinary is not configured, cannot delete avatar");
            return;
        }
        
        try {
            // Extract public_id from Cloudinary URL
            // Format: https://res.cloudinary.com/cloud-name/image/upload/v1234567/avatars/userId/filename.jpg
            // public_id: avatars/userId/filename
            
            if (imageUrl.contains("cloudinary.com")) {
                String[] parts = imageUrl.split("/upload/");
                if (parts.length < 2) {
                    log.warn("Invalid Cloudinary URL format: {}", imageUrl);
                    return;
                }
                
                // Get path after /upload/vXXXXXXX/
                String pathAfterUpload = parts[1];
                String[] pathParts = pathAfterUpload.split("/");
                
                // Skip version (vXXXXXX) if present
                int startIndex = pathParts[0].startsWith("v") ? 1 : 0;
                
                // Reconstruct public_id (without file extension)
                StringBuilder publicId = new StringBuilder();
                for (int i = startIndex; i < pathParts.length; i++) {
                    if (i > startIndex) {
                        publicId.append("/");
                    }
                    // Remove file extension from last part
                    String part = pathParts[i];
                    if (i == pathParts.length - 1) {
                        int dotIndex = part.lastIndexOf('.');
                        if (dotIndex > 0) {
                            part = part.substring(0, dotIndex);
                        }
                    }
                    publicId.append(part);
                }
                
                // Delete from Cloudinary
                Map result = cloudinary.uploader().destroy(publicId.toString(), ObjectUtils.emptyMap());
                String resultStatus = (String) result.get("result");
                
                if ("ok".equals(resultStatus)) {
                    log.info("Successfully deleted avatar: {}", publicId);
                } else {
                    log.warn("Failed to delete avatar: {} (result: {})", publicId, resultStatus);
                }
            } else {
                log.warn("Not a Cloudinary URL, skipping delete: {}", imageUrl);
            }
            
        } catch (Exception e) {
            log.error("Error deleting avatar {}: {}", imageUrl, e.getMessage(), e);
        }
    }
}

