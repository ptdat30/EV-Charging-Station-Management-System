package com.analyticsservice.controller;

import com.analyticsservice.dto.*;
import com.analyticsservice.service.AnalyticsService;
import com.analyticsservice.service.AIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;

@Slf4j
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AIService aiService;

    /**
     * Parse ISO 8601 datetime string to LocalDateTime
     * Supports formats:
     * - "2025-10-18T17:00:00.000Z" (with timezone)
     * - "2025-10-18T17:00:00" (without timezone)
     * - "2025-10-18T17:00:00.000" (with milliseconds)
     */
    private LocalDateTime parseDateTime(String dateTimeStr) {
        try {
            // Try parsing as ISO 8601 with timezone (Z or +HH:mm)
            // Check if it has timezone indicator (Z, +, or - after position 10 which is after date part)
            boolean hasTimezone = dateTimeStr.endsWith("Z") || 
                                  dateTimeStr.contains("+") || 
                                  (dateTimeStr.length() > 10 && dateTimeStr.indexOf("-", 10) > 0);
            
            if (hasTimezone) {
                Instant instant = Instant.parse(dateTimeStr);
                return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
            }
            // Try parsing without timezone
            if (dateTimeStr.contains(".")) {
                // With milliseconds
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");
                return LocalDateTime.parse(dateTimeStr, formatter);
            } else {
                // Without milliseconds
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
                return LocalDateTime.parse(dateTimeStr, formatter);
            }
        } catch (DateTimeParseException e) {
            log.error("Failed to parse date: {}", dateTimeStr, e);
            throw new IllegalArgumentException("Invalid date format: " + dateTimeStr, e);
        }
    }

    /**
     * GET /api/analytics/revenue
     * Get revenue analytics with time-series data
     * 
     * Query params:
     * - stationId (optional): Filter by station
     * - region (optional): Filter by region
     * - from (required): Start date (ISO 8601)
     * - to (required): End date (ISO 8601)
     * - granularity (optional): "hour", "day", "week", "month" (default: "day")
     */
    @GetMapping("/revenue")
    public ResponseEntity<RevenueResponse> getRevenue(
            @RequestParam(required = false) Long stationId,
            @RequestParam(required = false) String region,
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false, defaultValue = "day") String granularity) {
        
        try {
            RevenueRequest request = new RevenueRequest();
            request.setStationId(stationId);
            request.setRegion(region);
            // Parse ISO 8601 with timezone (e.g., "2025-10-18T17:00:00.000Z")
            request.setFrom(parseDateTime(from));
            request.setTo(parseDateTime(to));
            request.setGranularity(granularity);

            RevenueResponse response = analyticsService.getRevenue(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting revenue data", e);
            throw new RuntimeException("Failed to get revenue data: " + e.getMessage(), e);
        }
    }

    /**
     * GET /api/analytics/usage
     * Get usage statistics (sessions, energy, duration)
     * 
     * Query params:
     * - stationId (optional): Filter by station
     * - region (optional): Filter by region
     * - from (required): Start date (ISO 8601)
     * - to (required): End date (ISO 8601)
     */
    @GetMapping("/usage")
    public ResponseEntity<UsageResponse> getUsage(
            @RequestParam(required = false) Long stationId,
            @RequestParam(required = false) String region,
            @RequestParam String from,
            @RequestParam String to) {
        
        try {
            UsageRequest request = new UsageRequest();
            request.setStationId(stationId);
            request.setRegion(region);
            request.setFrom(parseDateTime(from));
            request.setTo(parseDateTime(to));

            UsageResponse response = analyticsService.getUsage(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting usage data", e);
            throw new RuntimeException("Failed to get usage data: " + e.getMessage(), e);
        }
    }

    /**
     * GET /api/analytics/peak-hours
     * Get peak hours analysis (hourly distribution)
     * 
     * Query params:
     * - stationId (optional): Filter by station
     * - region (optional): Filter by region
     * - from (required): Start date (ISO 8601)
     * - to (required): End date (ISO 8601)
     */
    @GetMapping("/peak-hours")
    public ResponseEntity<PeakHoursResponse> getPeakHours(
            @RequestParam(required = false) Long stationId,
            @RequestParam(required = false) String region,
            @RequestParam String from,
            @RequestParam String to) {
        
        try {
            PeakHoursRequest request = new PeakHoursRequest();
            request.setStationId(stationId);
            request.setRegion(region);
            request.setFrom(parseDateTime(from));
            request.setTo(parseDateTime(to));

            PeakHoursResponse response = analyticsService.getPeakHours(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting peak hours data", e);
            throw new RuntimeException("Failed to get peak hours data: " + e.getMessage(), e);
        }
    }

    /**
     * GET /api/analytics/forecast
     * Get AI/ML forecast for future demand
     * 
     * Query params:
     * - stationId (optional): Forecast for specific station
     * - region (optional): Forecast for specific region
     * - horizonMonths (required): Forecast horizon (3, 6, or 12 months)
     */
    @GetMapping("/forecast")
    public ResponseEntity<ForecastResponse> getForecast(
            @RequestParam(required = false) Long stationId,
            @RequestParam(required = false) String region,
            @RequestParam Integer horizonMonths) {
        
        try {
            ForecastRequest request = new ForecastRequest();
            request.setStationId(stationId);
            request.setRegion(region);
            request.setHorizonMonths(horizonMonths);

            ForecastResponse response = analyticsService.getForecast(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting forecast data", e);
            throw new RuntimeException("Failed to get forecast data: " + e.getMessage(), e);
        }
    }

    /**
     * POST /api/analytics/revenue (alternative with request body)
     */
    @PostMapping("/revenue")
    public ResponseEntity<RevenueResponse> getRevenuePost(@Valid @RequestBody RevenueRequest request) {
        RevenueResponse response = analyticsService.getRevenue(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/analytics/usage (alternative with request body)
     */
    @PostMapping("/usage")
    public ResponseEntity<UsageResponse> getUsagePost(@Valid @RequestBody UsageRequest request) {
        UsageResponse response = analyticsService.getUsage(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/analytics/peak-hours (alternative with request body)
     */
    @PostMapping("/peak-hours")
    public ResponseEntity<PeakHoursResponse> getPeakHoursPost(@Valid @RequestBody PeakHoursRequest request) {
        PeakHoursResponse response = analyticsService.getPeakHours(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/analytics/forecast (alternative with request body)
     */
    @PostMapping("/forecast")
    public ResponseEntity<ForecastResponse> getForecastPost(@Valid @RequestBody ForecastRequest request) {
        ForecastResponse response = analyticsService.getForecast(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/analytics/ai/chat
     * Chat with AI assistant for infrastructure upgrade suggestions
     * 
     * Request body:
     * - message: User's question/message
     * - context: Optional context ('revenue', 'usage', 'forecast', 'general')
     * - analyticsData: Optional current analytics data for context
     * - conversationHistory: Optional previous messages
     */
    @PostMapping("/ai/chat")
    public ResponseEntity<AIChatResponse> chatWithAI(@Valid @RequestBody AIChatRequest request) {
        try {
            log.info("AI chat request: {}", request.getMessage());
            AIChatResponse response = aiService.chat(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing AI chat request", e);
            AIChatResponse errorResponse = new AIChatResponse(
                "Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
                Arrays.asList("Hỏi về doanh thu", "Hỏi về khung giờ cao điểm", "Hỏi về trạm sạc"),
                request.getContext(),
                false,
                e.getMessage()
            );
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}

