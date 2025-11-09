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
     * Delete avatar from Cloudinary
     * @param imageUrl URL of image to delete
     */
    void deleteAvatar(String imageUrl);
}

