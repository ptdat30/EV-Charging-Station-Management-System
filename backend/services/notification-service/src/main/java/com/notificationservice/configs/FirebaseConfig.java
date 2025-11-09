package com.notificationservice.configs;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {
    
    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);
    
    @Value("${firebase.config.path:}")
    private String firebaseConfigPath;
    
    @Value("${firebase.enabled:false}")
    private boolean firebaseEnabled;
    
    @PostConstruct
    public void initialize() {
        if (!firebaseEnabled) {
            log.warn("Firebase is disabled. Push notifications will not be sent.");
            return;
        }
        
        try {
            if (firebaseConfigPath == null || firebaseConfigPath.isBlank()) {
                log.warn("Firebase config path is not set. Push notifications will not be sent.");
                log.info("To enable Firebase, set 'firebase.config.path' in application.properties");
                return;
            }
            
            // Load Firebase credentials from file
            InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream(firebaseConfigPath);
            
            if (serviceAccount == null) {
                log.error("Firebase config file not found at: {}", firebaseConfigPath);
                log.info("Please place your firebase-adminsdk.json file in src/main/resources/");
                return;
            }
            
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
            
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                log.info("Firebase Admin SDK initialized successfully");
            } else {
                log.info("Firebase Admin SDK already initialized");
            }
            
        } catch (IOException e) {
            log.error("Failed to initialize Firebase Admin SDK: {}", e.getMessage(), e);
            log.warn("Push notifications will not be available");
        } catch (Exception e) {
            log.error("Unexpected error initializing Firebase: {}", e.getMessage(), e);
        }
    }
}

