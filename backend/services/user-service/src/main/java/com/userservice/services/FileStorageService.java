package com.userservice.services;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /**
     * Upload avatar image to Cloudinary
     * @param file Image file
     * @param userId User ID
     * @return Public URL of uploaded image
     */
    String uploadAvatar(MultipartFile file, Long userId) throws Exception;
    
    /**
     * Upload image to Cloudinary with custom folder
     * @param userId User ID
     * @param file Image file
     * @param folderPrefix Folder prefix (e.g., "avatars", "vehicles")
     * @return Public URL of uploaded image
     */
    String uploadAvatar(Long userId, MultipartFile file, String folderPrefix) throws Exception;
    
    /**
     * Delete avatar from Cloudinary
     * @param imageUrl URL of image to delete
     */
    void deleteAvatar(String imageUrl);
}

