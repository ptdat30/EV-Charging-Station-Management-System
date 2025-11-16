package com.analyticsservice.service;

import com.analyticsservice.dto.*;
import com.analyticsservice.entities.SessionAnalytics;
import com.analyticsservice.repositories.SessionAnalyticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final SessionAnalyticsRepository sessionAnalyticsRepository;
    private final BigQueryClientService bigQueryClientService;
    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    /**
     * Get revenue analytics with time-series data
     */
    @Transactional(readOnly = true)
    public RevenueResponse getRevenue(RevenueRequest request) {
        log.info("Getting revenue data: stationId={}, region={}, from={}, to={}", 
            request.getStationId(), request.getRegion(), request.getFrom(), request.getTo());

        // Option 1: Query from local DB (session_analytics table)
        List<SessionAnalytics> sessions = sessionAnalyticsRepository
            .findByStartTimeBetween(request.getFrom(), request.getTo());

        // Filter by station and region if specified
        if (request.getStationId() != null) {
            sessions = sessions.stream()
                .filter(s -> s.getStationId().equals(request.getStationId()))
                .collect(Collectors.toList());
        }

        // Option 2: Query from BigQuery (if enabled)
        // List<Map<String, Object>> bigQueryData = bigQueryClientService.queryRevenueData(
        //     request.getFrom(), request.getTo(), request.getStationId(), 
        //     request.getRegion(), request.getGranularity()
        // );

        // Aggregate data by time granularity
        List<RevenueResponse.RevenueDataPoint> dataPoints = aggregateRevenueData(
            sessions, request.getGranularity() != null ? request.getGranularity() : "day");

        // Calculate totals
        BigDecimal totalRevenue = sessions.stream()
            .map(SessionAnalytics::getCost)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Long totalSessions = (long) sessions.size();

        BigDecimal totalEnergy = sessions.stream()
            .map(SessionAnalytics::getEnergyConsumed)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate summary stats
        BigDecimal avgRevenuePerSession = totalSessions > 0 
            ? totalRevenue.divide(BigDecimal.valueOf(totalSessions), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        BigDecimal avgEnergyPerSession = totalSessions > 0
            ? totalEnergy.divide(BigDecimal.valueOf(totalSessions), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        RevenueResponse.SummaryStats summary = new RevenueResponse.SummaryStats(
            avgRevenuePerSession,
            avgEnergyPerSession,
            BigDecimal.ZERO // TODO: Calculate growth vs previous period
        );

        return new RevenueResponse(dataPoints, totalRevenue, totalSessions, totalEnergy, summary);
    }

    /**
     * Get usage analytics
     */
    @Transactional(readOnly = true)
    public UsageResponse getUsage(UsageRequest request) {
        log.info("Getting usage data: stationId={}, region={}, from={}, to={}",
            request.getStationId(), request.getRegion(), request.getFrom(), request.getTo());

        List<SessionAnalytics> sessions = sessionAnalyticsRepository
            .findByStartTimeBetween(request.getFrom(), request.getTo());

        if (request.getStationId() != null) {
            sessions = sessions.stream()
                .filter(s -> s.getStationId().equals(request.getStationId()))
                .collect(Collectors.toList());
        }

        // Calculate totals
        Long totalSessions = (long) sessions.size();
        BigDecimal totalEnergy = sessions.stream()
            .map(SessionAnalytics::getEnergyConsumed)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Long totalChargingMinutes = sessions.stream()
            .map(SessionAnalytics::getSessionDuration)
            .filter(Objects::nonNull)
            .mapToLong(Integer::longValue)
            .sum();

        Long uniqueUsers = sessions.stream()
            .map(SessionAnalytics::getUserId)
            .filter(Objects::nonNull)
            .distinct()
            .count();

        // Fetch all station names from station-service (batch fetch for performance)
        Map<Long, String> stationNameMap = fetchAllStationNames();
        
        // Top stations by usage and revenue
        Map<Long, UsageResponse.StationUsage> stationMap = new HashMap<>();
        sessions.forEach(session -> {
            Long stationId = session.getStationId();
            if (stationId == null) return;

            UsageResponse.StationUsage usage = stationMap.computeIfAbsent(stationId, 
                id -> {
                    // Get station name from cached map
                    String stationName = stationNameMap.getOrDefault(id, "Trạm " + id);
                    return new UsageResponse.StationUsage(id, stationName, 0L, BigDecimal.ZERO, 0L, BigDecimal.ZERO);
                });

            usage.setSessions(usage.getSessions() + 1);
            if (session.getEnergyConsumed() != null) {
                usage.setEnergyKwh(usage.getEnergyKwh().add(session.getEnergyConsumed()));
            }
            if (session.getSessionDuration() != null) {
                usage.setChargingMinutes(usage.getChargingMinutes() + session.getSessionDuration());
            }
            // Calculate revenue from cost
            if (session.getCost() != null) {
                usage.setRevenue(usage.getRevenue().add(session.getCost()));
            }
        });

        List<UsageResponse.StationUsage> topStations = stationMap.values().stream()
            .sorted((a, b) -> {
                // Sort by revenue first, then by sessions
                int revenueCompare = b.getRevenue().compareTo(a.getRevenue());
                if (revenueCompare != 0) return revenueCompare;
                return Long.compare(b.getSessions(), a.getSessions());
            })
            .limit(10)
            .collect(Collectors.toList());

        // Usage stats
        BigDecimal avgSessionDuration = totalSessions > 0
            ? BigDecimal.valueOf(totalChargingMinutes).divide(BigDecimal.valueOf(totalSessions), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        BigDecimal avgEnergyPerSession = totalSessions > 0
            ? totalEnergy.divide(BigDecimal.valueOf(totalSessions), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        UsageResponse.UsageStats stats = new UsageResponse.UsageStats(
            avgSessionDuration,
            avgEnergyPerSession,
            BigDecimal.ZERO // TODO: Calculate utilization rate
        );

        return new UsageResponse(totalSessions, totalEnergy, totalChargingMinutes, uniqueUsers, topStations, stats);
    }

    /**
     * Get peak hours analysis
     */
    @Transactional(readOnly = true)
    public PeakHoursResponse getPeakHours(PeakHoursRequest request) {
        log.info("Getting peak hours: stationId={}, region={}, from={}, to={}",
            request.getStationId(), request.getRegion(), request.getFrom(), request.getTo());

        List<SessionAnalytics> sessions = sessionAnalyticsRepository
            .findByStartTimeBetween(request.getFrom(), request.getTo());

        if (request.getStationId() != null) {
            sessions = sessions.stream()
                .filter(s -> s.getStationId().equals(request.getStationId()))
                .collect(Collectors.toList());
        }

        // Count sessions by hour
        Map<Integer, Long> hourlyCounts = new HashMap<>();
        sessions.forEach(session -> {
            Integer hour = session.getHourOfDay();
            if (hour != null && hour >= 0 && hour < 24) {
                hourlyCounts.put(hour, hourlyCounts.getOrDefault(hour, 0L) + 1);
            }
        });

        Long totalSessions = (long) sessions.size();

        // Build hourly data
        List<PeakHoursResponse.HourlyData> hourlyData = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            Long count = hourlyCounts.getOrDefault(hour, 0L);
            Double percentage = totalSessions > 0 
                ? (count.doubleValue() / totalSessions) * 100.0 
                : 0.0;

            String hourLabel = String.format("%02d:00", hour);
            hourlyData.add(new PeakHoursResponse.HourlyData(hour, hourLabel, count, percentage));
        }

        // Find top peak hours
        List<PeakHoursResponse.PeakHour> topPeakHours = hourlyData.stream()
            .sorted((a, b) -> Long.compare(b.getSessions(), a.getSessions()))
            .limit(5)
            .map(h -> new PeakHoursResponse.PeakHour(
                h.getHour(), h.getHourLabel(), h.getSessions(), h.getPercentage()))
            .collect(Collectors.toList());

        return new PeakHoursResponse(hourlyData, topPeakHours);
    }

    /**
     * Get forecast with AI/ML predictions
     */
    @Transactional(readOnly = true)
    public ForecastResponse getForecast(ForecastRequest request) {
        log.info("Getting forecast: stationId={}, region={}, horizonMonths={}",
            request.getStationId(), request.getRegion(), request.getHorizonMonths());

        // TODO: Call ML service endpoint
        // For now, return mock data with rule-based suggestions

        List<ForecastResponse.ForecastDataPoint> forecastData = generateMockForecast(request.getHorizonMonths());
        List<ForecastResponse.InfrastructureSuggestion> suggestions = generateInfrastructureSuggestions(request);

        ForecastResponse.ForecastSummary summary = new ForecastResponse.ForecastSummary(
            BigDecimal.valueOf(150), // avg sessions per month
            BigDecimal.valueOf(5000000), // avg revenue per month
            15.5 // growth rate %
        );

        return new ForecastResponse(forecastData, suggestions, summary);
    }

    // Helper methods
    private List<RevenueResponse.RevenueDataPoint> aggregateRevenueData(
            List<SessionAnalytics> sessions, String granularity) {
        
        Map<String, RevenueResponse.RevenueDataPoint> aggregated = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (SessionAnalytics session : sessions) {
            LocalDateTime startTime = session.getStartTime();
            if (startTime == null) continue;

            String timeKey;
            switch (granularity.toLowerCase()) {
                case "hour":
                    timeKey = startTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:00"));
                    break;
                case "week":
                    timeKey = "Week " + startTime.getDayOfYear() / 7;
                    break;
                case "month":
                    timeKey = startTime.format(DateTimeFormatter.ofPattern("yyyy-MM"));
                    break;
                default: // day
                    timeKey = startTime.format(formatter);
            }

            RevenueResponse.RevenueDataPoint point = aggregated.computeIfAbsent(timeKey,
                k -> new RevenueResponse.RevenueDataPoint(k, BigDecimal.ZERO, 0L, BigDecimal.ZERO));

            point.setRevenue(point.getRevenue().add(
                session.getCost() != null ? session.getCost() : BigDecimal.ZERO));
            point.setSessions(point.getSessions() + 1);
            point.setEnergyKwh(point.getEnergyKwh().add(
                session.getEnergyConsumed() != null ? session.getEnergyConsumed() : BigDecimal.ZERO));
        }

        return new ArrayList<>(aggregated.values());
    }

    private List<ForecastResponse.ForecastDataPoint> generateMockForecast(int horizonMonths) {
        List<ForecastResponse.ForecastDataPoint> forecast = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (int i = 1; i <= horizonMonths; i++) {
            LocalDateTime future = now.plusMonths(i);
            String month = future.format(DateTimeFormatter.ofPattern("yyyy-MM"));

            // Mock: increasing trend
            long predictedSessions = 150L + (i * 10);
            BigDecimal predictedRevenue = BigDecimal.valueOf(5000000 + (i * 200000));
            BigDecimal predictedEnergy = BigDecimal.valueOf(750.0 + (i * 25.0));

            forecast.add(new ForecastResponse.ForecastDataPoint(
                month, predictedSessions, predictedRevenue, predictedEnergy, 0.85));
        }

        return forecast;
    }

    private List<ForecastResponse.InfrastructureSuggestion> generateInfrastructureSuggestions(
            ForecastRequest request) {
        
        List<ForecastResponse.InfrastructureSuggestion> suggestions = new ArrayList<>();

        // Rule-based suggestions (can be replaced with ML predictions)
        if (request.getStationId() != null) {
            suggestions.add(new ForecastResponse.InfrastructureSuggestion(
                "UPGRADE_STATION",
                request.getStationId().toString(),
                null,
                String.format("Trạm %d dự kiến quá tải 30%% trong %d tháng tới, đề xuất nâng cấp công suất.",
                    request.getStationId(), request.getHorizonMonths()),
                "HIGH",
                "Dự báo tải đỉnh vượt 80% công suất hiện tại"
            ));
        } else if (request.getRegion() != null) {
            suggestions.add(new ForecastResponse.InfrastructureSuggestion(
                "ADD_STATION",
                null,
                request.getRegion(),
                String.format("Khu vực %s cần thêm 2 trạm mới để đáp ứng nhu cầu dự báo trong %d tháng tới.",
                    request.getRegion(), request.getHorizonMonths()),
                "MEDIUM",
                "Nhu cầu tăng > 30% so với hiện tại"
            ));
        }

        return suggestions;
    }

    /**
     * Fetch all station names from station-service (batch fetch for better performance)
     */
    @SuppressWarnings("unchecked")
    private Map<Long, String> fetchAllStationNames() {
        Map<Long, String> stationNameMap = new HashMap<>();
        try {
            String url = "http://localhost:8081/api/stations/getall";
            ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> stations = response.getBody();
                for (Map<String, Object> station : stations) {
                    Long stationId = getLongFromMap(station, "stationId");
                    if (stationId != null) {
                        String name = (String) station.get("stationName");
                        if (name == null || name.isEmpty()) {
                            name = (String) station.get("stationCode");
                        }
                        if (name == null || name.isEmpty()) {
                            name = (String) station.get("name");
                        }
                        if (name != null && !name.isEmpty()) {
                            stationNameMap.put(stationId, name);
                        }
                    }
                }
                log.debug("Fetched {} station names from station-service", stationNameMap.size());
            }
        } catch (Exception e) {
            log.warn("Could not fetch station names from station-service: {}", e.getMessage());
        }
        return stationNameMap;
    }

    private Long getLongFromMap(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).longValue();
        if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}

