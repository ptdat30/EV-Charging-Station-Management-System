package com.chargingservice.configs;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Configuration
public class JacksonConfig {

    private static final DateTimeFormatter[] PARSERS = {
        DateTimeFormatter.ISO_LOCAL_DATE_TIME,                    // "2025-10-31T09:00:00"
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),     // "2025-10-31T09:00:00"
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS"), // "2025-10-31T09:00:00.000"
        DateTimeFormatter.ISO_DATE_TIME                          // "2025-10-31T09:00:00Z"
    };

    @Bean
    @Primary
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        
        // Custom deserializer hỗ trợ nhiều format
        javaTimeModule.addDeserializer(LocalDateTime.class, new JsonDeserializer<LocalDateTime>() {
            @Override
            public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
                String dateString = p.getText().trim();
                // Remove timezone suffix if present (Z, +07:00, etc.) for LocalDateTime
                if (dateString.endsWith("Z")) {
                    dateString = dateString.substring(0, dateString.length() - 1);
                } else if (dateString.contains("+") || dateString.contains("-")) {
                    int idx = Math.max(dateString.lastIndexOf('+'), dateString.lastIndexOf('-'));
                    if (idx > 10) { // Has timezone offset
                        dateString = dateString.substring(0, idx);
                    }
                }
                
                // Try each formatter
                for (DateTimeFormatter formatter : PARSERS) {
                    try {
                        return LocalDateTime.parse(dateString, formatter);
                    } catch (DateTimeParseException e) {
                        // Try next formatter
                    }
                }
                
                throw new IOException("Unable to parse LocalDateTime: " + p.getText());
            }
        });
        
        // Serializer: LocalDateTime -> ISO string
        javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        
        return builder
                .modules(javaTimeModule)
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();
    }
}
