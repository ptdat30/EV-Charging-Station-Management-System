package com.analyticsservice.controller;

import com.analyticsservice.service.DataSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/analytics/sync")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class DataSyncController {

    private final DataSyncService dataSyncService;

    /**
     * Manual trigger to sync data from charging-service
     * POST /api/analytics/sync/trigger
     */
    @PostMapping("/trigger")
    public ResponseEntity<Map<String, Object>> triggerSync() {
        try {
            int synced = dataSyncService.syncSessionsFromChargingService();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Data sync completed");
            response.put("syncedCount", synced);
            if (synced == 0) {
                response.put("warning", "No new sessions synced. Charging-service may not be available or no new data.");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error triggering sync", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Create mock data for testing
     * POST /api/analytics/sync/mock-data
     */
    @PostMapping("/mock-data")
    public ResponseEntity<Map<String, Object>> createMockData() {
        try {
            dataSyncService.createMockData();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Mock data created successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating mock data", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}

