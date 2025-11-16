package com.analyticsservice.service;

import com.analyticsservice.entities.SessionAnalytics;
import com.analyticsservice.repositories.SessionAnalyticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataSyncService {

    private final SessionAnalyticsRepository sessionAnalyticsRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Sync data from charging-service to session_analytics table
     * This should be called periodically or triggered by events
     */
    @Transactional
    public int syncSessionsFromChargingService() {
        try {
            log.info("Starting data sync from charging-service...");
            
            // Fetch from charging-service
            List<Map<String, Object>> sessions = fetchSessionsFromChargingService();
            
            if (sessions == null || sessions.isEmpty()) {
                log.warn("No sessions found from charging-service (service may not be available or no data)");
                return 0;
            }

            int synced = 0;
            for (Map<String, Object> session : sessions) {
                try {
                    SessionAnalytics analytics = convertToSessionAnalytics(session);
                    if (analytics != null) {
                        // Check if already exists
                        Optional<SessionAnalytics> existing = sessionAnalyticsRepository
                            .findBySessionId(analytics.getSessionId());
                        
                        if (existing.isEmpty()) {
                            sessionAnalyticsRepository.save(analytics);
                            synced++;
                        }
                    }
                } catch (Exception e) {
                    log.error("Error syncing session: {}", session, e);
                }
            }
            
            log.info("Synced {} sessions to analytics database", synced);
            return synced;
        } catch (Exception e) {
            log.error("Error syncing data from charging-service", e);
            return 0;
        }
    }

    /**
     * Fetch sessions from charging-service
     * TODO: Replace with FeignClient or proper service discovery
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchSessionsFromChargingService() {
        try {
            // Call charging-service API
            String url = "http://localhost:8082/api/sessions";
            log.info("Fetching sessions from charging-service: {}", url);
            
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> sessions = response.getBody();
                log.info("Fetched {} sessions from charging-service", sessions.size());
                return sessions;
            } else {
                log.warn("Charging-service returned empty or error response");
                return Collections.emptyList();
            }
        } catch (Exception e) {
            log.warn("Could not fetch from charging-service: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Create mock data for testing
     */
    @Transactional
    public void createMockData() {
        log.info("Creating mock analytics data...");
        
        LocalDateTime now = LocalDateTime.now();
        Random random = new Random();
        
        // Create data for last 30 days
        for (int day = 0; day < 30; day++) {
            LocalDateTime date = now.minusDays(day);
            
            // Create 5-15 sessions per day
            int sessionsPerDay = 5 + random.nextInt(11);
            
            for (int i = 0; i < sessionsPerDay; i++) {
                SessionAnalytics analytics = new SessionAnalytics();
                
                // Random session time during the day
                int hour = random.nextInt(24);
                int minute = random.nextInt(60);
                LocalDateTime startTime = date.withHour(hour).withMinute(minute).withSecond(0);
                LocalDateTime endTime = startTime.plusMinutes(30 + random.nextInt(120)); // 30-150 minutes
                
                analytics.setSessionId((long) (day * 1000 + i));
                analytics.setUserId((long) (1 + random.nextInt(50))); // Random user 1-50
                analytics.setStationId((long) (1 + random.nextInt(10))); // Random station 1-10
                analytics.setChargingPointId((long) (1 + random.nextInt(3))); // Random charger 1-3
                analytics.setStartTime(startTime);
                analytics.setEndTime(endTime);
                analytics.setSessionDuration((int) java.time.Duration.between(startTime, endTime).toMinutes());
                analytics.setEnergyConsumed(BigDecimal.valueOf(10 + random.nextDouble() * 40).setScale(2, java.math.RoundingMode.HALF_UP));
                analytics.setCost(analytics.getEnergyConsumed().multiply(BigDecimal.valueOf(3000)).setScale(2, java.math.RoundingMode.HALF_UP));
                analytics.setPaymentMethod(random.nextBoolean() ? "CREDIT_CARD" : "WALLET");
                analytics.setHourOfDay(hour);
                analytics.setDayOfWeek(startTime.getDayOfWeek().toString());
                analytics.setIsPeakHour(hour >= 8 && hour <= 20);
                
                sessionAnalyticsRepository.save(analytics);
            }
        }
        
        log.info("Created mock analytics data for last 30 days");
    }

    /**
     * Convert session map to SessionAnalytics entity
     */
    private SessionAnalytics convertToSessionAnalytics(Map<String, Object> session) {
        try {
            SessionAnalytics analytics = new SessionAnalytics();
            
            analytics.setSessionId(getLong(session, "sessionId"));
            analytics.setUserId(getLong(session, "userId"));
            analytics.setStationId(getLong(session, "stationId"));
            analytics.setChargingPointId(getLong(session, "chargerId"));
            
            // Parse dates
            if (session.get("startTime") != null) {
                analytics.setStartTime(parseDateTime(session.get("startTime").toString()));
            }
            if (session.get("endTime") != null) {
                analytics.setEndTime(parseDateTime(session.get("endTime").toString()));
            }
            
            // Calculate duration
            if (analytics.getStartTime() != null && analytics.getEndTime() != null) {
                analytics.setSessionDuration((int) java.time.Duration.between(
                    analytics.getStartTime(), analytics.getEndTime()).toMinutes());
            }
            
            analytics.setEnergyConsumed(getBigDecimal(session, "energyConsumed"));
            
            // Calculate cost from pricePerKwh * energyConsumed
            BigDecimal pricePerKwh = getBigDecimal(session, "pricePerKwh");
            if (pricePerKwh != null && analytics.getEnergyConsumed() != null) {
                analytics.setCost(pricePerKwh.multiply(analytics.getEnergyConsumed()).setScale(2, java.math.RoundingMode.HALF_UP));
            }
            
            // Get payment info from payment-service using sessionId
            Long sessionId = analytics.getSessionId();
            if (sessionId != null) {
                Map<String, Object> paymentInfo = fetchPaymentInfoFromPaymentService(sessionId);
                if (paymentInfo != null) {
                    // Update cost if not already set
                    if (analytics.getCost() == null) {
                        BigDecimal costFromPayment = getBigDecimal(paymentInfo, "amount");
                        if (costFromPayment != null) {
                            analytics.setCost(costFromPayment);
                        }
                    }
                    // Set payment method
                    String paymentMethod = getString(paymentInfo, "paymentMethod");
                    if (paymentMethod != null) {
                        analytics.setPaymentMethod(paymentMethod);
                    } else {
                        analytics.setPaymentMethod("UNKNOWN");
                    }
                } else {
                    analytics.setPaymentMethod("UNKNOWN");
                }
            } else {
                analytics.setPaymentMethod("UNKNOWN");
            }
            
            // Extract hour and day
            if (analytics.getStartTime() != null) {
                analytics.setHourOfDay(analytics.getStartTime().getHour());
                analytics.setDayOfWeek(analytics.getStartTime().getDayOfWeek().toString());
                analytics.setIsPeakHour(analytics.getHourOfDay() >= 8 && analytics.getHourOfDay() <= 20);
            }
            
            return analytics;
        } catch (Exception e) {
            log.error("Error converting session to analytics: {}", e.getMessage());
            return null;
        }
    }

    private Long getLong(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).longValue();
        if (value instanceof String) return Long.parseLong((String) value);
        return null;
    }

    private BigDecimal getBigDecimal(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof BigDecimal) return (BigDecimal) value;
        if (value instanceof Number) return BigDecimal.valueOf(((Number) value).doubleValue());
        if (value instanceof String) return new BigDecimal((String) value);
        return null;
    }

    private String getString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        try {
            if (dateTimeStr.contains("T")) {
                return LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }
            return LocalDateTime.parse(dateTimeStr);
        } catch (Exception e) {
            log.error("Error parsing date: {}", dateTimeStr, e);
            return null;
        }
    }

    /**
     * Fetch payment info from payment-service using sessionId
     * Returns the first payment for the session (usually there's only one)
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchPaymentInfoFromPaymentService(Long sessionId) {
        try {
            String url = "http://localhost:8083/api/payments/session/" + sessionId;
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> payments = response.getBody();
                if (!payments.isEmpty()) {
                    // Return the first payment (usually there's only one payment per session)
                    return payments.get(0);
                }
            }
        } catch (Exception e) {
            log.debug("Could not fetch payment info from payment-service for sessionId {}: {}", sessionId, e.getMessage());
        }
        return null;
    }

    /**
     * Scheduled task to sync data every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void scheduledSync() {
        syncSessionsFromChargingService();
    }
}

