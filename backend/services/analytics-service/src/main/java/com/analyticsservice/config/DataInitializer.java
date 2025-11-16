package com.analyticsservice.config;

import com.analyticsservice.repositories.SessionAnalyticsRepository;
import com.analyticsservice.service.DataSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SessionAnalyticsRepository sessionAnalyticsRepository;
    private final DataSyncService dataSyncService;

    @Override
    public void run(String... args) {
        // Check if database is empty
        long count = sessionAnalyticsRepository.count();
        if (count == 0) {
            log.info("Database is empty, syncing data from charging-service...");
            // Try to sync real data from charging-service
            dataSyncService.syncSessionsFromChargingService();
            log.info("Data sync completed");
        } else {
            log.info("Database already has {} analytics records", count);
        }
    }
}

