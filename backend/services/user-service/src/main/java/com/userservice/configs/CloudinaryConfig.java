package com.userservice.configs;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {
    
    private static final Logger log = LoggerFactory.getLogger(CloudinaryConfig.class);
    
    @Value("${cloudinary.enabled:false}")
    private boolean cloudinaryEnabled;
    
    @Value("${cloudinary.cloud-name:}")
    private String cloudName;
    
    @Value("${cloudinary.api-key:}")
    private String apiKey;
    
    @Value("${cloudinary.api-secret:}")
    private String apiSecret;
    
    @Bean
    public Cloudinary cloudinary() {
        if (!cloudinaryEnabled) {
            log.warn("Cloudinary is disabled. Avatar upload will not work.");
            log.info("To enable Cloudinary, set 'cloudinary.enabled=true' in application.yml");
            return null;
        }
        
        if (cloudName == null || cloudName.isBlank() || 
            apiKey == null || apiKey.isBlank() || 
            apiSecret == null || apiSecret.isBlank()) {
            log.error("Cloudinary credentials are not configured properly");
            log.info("Please set cloudinary.cloud-name, api-key, and api-secret in application.yml");
            return null;
        }
        
        try {
            Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
            ));
            
            log.info("Cloudinary initialized successfully");
            log.info("Cloud Name: {}", cloudName);
            return cloudinary;
            
        } catch (Exception e) {
            log.error("Failed to initialize Cloudinary: {}", e.getMessage(), e);
            return null;
        }
    }
}

