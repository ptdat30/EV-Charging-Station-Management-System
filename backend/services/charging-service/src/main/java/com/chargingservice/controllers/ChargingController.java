// ===============================================================
// FILE: ChargingController.java (Phiên bản hoàn thiện)
// PACKAGE: com.chargingservice.controllers
// ===============================================================
package com.chargingservice.controllers;

import com.chargingservice.dtos.SessionResponseDto;
import com.chargingservice.dtos.StartSessionRequestDto;
import com.chargingservice.services.ChargingService;
import lombok.RequiredArgsConstructor;
import com.chargingservice.repositories.ChargingSessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class ChargingController {

    private final ChargingService chargingService;
    private final ChargingSessionRepository sessionRepository;

    // [COMMAND]: POST /api/sessions/start
    @PostMapping("/start")
    public ResponseEntity<SessionResponseDto> startChargingSession(@RequestBody StartSessionRequestDto requestDto) {
        SessionResponseDto newSession = chargingService.startSession(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newSession);
    }

    // [COMMAND]: POST /api/sessions/{id}/stop
    @PostMapping("/{id}/stop")
    public ResponseEntity<SessionResponseDto> stopChargingSession(@PathVariable Long id) {
        SessionResponseDto stoppedSession = chargingService.stopSession(id);
        return ResponseEntity.ok(stoppedSession);
    }

    // [COMMAND]: POST /api/sessions/{id}/cancel
    @PostMapping("/{id}/cancel")
    public ResponseEntity<SessionResponseDto> cancelChargingSession(@PathVariable Long id) {
        SessionResponseDto cancelledSession = chargingService.cancelSession(id);
        return ResponseEntity.ok(cancelledSession);
    }

    // [COMMAND]: GET /api/sessions/{id}
    @GetMapping("/{id}")
    public ResponseEntity<SessionResponseDto> getSessionById(@PathVariable Long id) {
        return ResponseEntity.ok(chargingService.getSessionById(id));
    }

    // [COMMAND]: GET /api/sessions
    @GetMapping
    public ResponseEntity<List<SessionResponseDto>> getAllSessions() {
        return ResponseEntity.ok(chargingService.getAllSessions());
    }

    // [COMMAND]: GET /api/sessions/active
    @GetMapping("/active")
    public ResponseEntity<SessionResponseDto> getActiveSession(@RequestHeader("X-User-Id") Long userId) {
        // Tìm phiên sạc đang charging gần nhất của user
        var opt = sessionRepository.findFirstByUserIdAndSessionStatusOrderByStartTimeDesc(
                userId, com.chargingservice.entities.ChargingSession.SessionStatus.charging);
        return opt.map(s -> ResponseEntity.ok(chargingService.getSessionById(s.getSessionId())))
                .orElse(ResponseEntity.noContent().build());
    }
    
    /**
     * Get real-time charging status (SOC%, time remaining, cost)
     * GET /api/sessions/{id}/status
     */
    @GetMapping("/{id}/status")
    public ResponseEntity<com.chargingservice.dtos.SessionStatusDto> getSessionStatus(@PathVariable Long id) {
        return ResponseEntity.ok(chargingService.getSessionStatus(id));
    }
    
    /**
     * Get dashboard statistics for user
     * GET /api/sessions/dashboard/stats
     */
    @GetMapping("/dashboard/stats")
    public ResponseEntity<java.util.Map<String, Object>> getDashboardStats(@RequestHeader("X-User-Id") Long userId) {
        var sessions = sessionRepository.findByUserIdOrderByStartTimeDesc(userId);
        
        // Calculate stats
        long totalSessions = sessions.size();
        long completedSessions = sessions.stream()
            .filter(s -> s.getSessionStatus() == com.chargingservice.entities.ChargingSession.SessionStatus.completed)
            .count();
        
        // Calculate total energy consumed this month
        var now = java.time.LocalDateTime.now();
        var startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        var totalEnergyThisMonth = sessions.stream()
            .filter(s -> s.getEndTime() != null && s.getEndTime().isAfter(startOfMonth))
            .filter(s -> s.getSessionStatus() == com.chargingservice.entities.ChargingSession.SessionStatus.completed)
            .map(s -> s.getEnergyConsumed() != null ? s.getEnergyConsumed() : java.math.BigDecimal.ZERO)
            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        
        // Calculate last month energy for comparison
        var startOfLastMonth = startOfMonth.minusMonths(1);
        var endOfLastMonth = startOfMonth.minusSeconds(1);
        var totalEnergyLastMonth = sessions.stream()
            .filter(s -> s.getEndTime() != null && s.getEndTime().isAfter(startOfLastMonth) && s.getEndTime().isBefore(endOfLastMonth))
            .filter(s -> s.getSessionStatus() == com.chargingservice.entities.ChargingSession.SessionStatus.completed)
            .map(s -> s.getEnergyConsumed() != null ? s.getEnergyConsumed() : java.math.BigDecimal.ZERO)
            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        
        // Calculate percentage change
        double energyChangePercent = 0.0;
        if (totalEnergyLastMonth.compareTo(java.math.BigDecimal.ZERO) > 0) {
            var diff = totalEnergyThisMonth.subtract(totalEnergyLastMonth);
            energyChangePercent = diff.divide(totalEnergyLastMonth, 4, java.math.RoundingMode.HALF_UP)
                .multiply(java.math.BigDecimal.valueOf(100)).doubleValue();
        } else if (totalEnergyThisMonth.compareTo(java.math.BigDecimal.ZERO) > 0) {
            energyChangePercent = 100.0; // First month with data
        }
        
        return ResponseEntity.ok(java.util.Map.of(
            "totalSessions", totalSessions,
            "completedSessions", completedSessions,
            "totalEnergyThisMonth", totalEnergyThisMonth,
            "totalEnergyLastMonth", totalEnergyLastMonth,
            "energyChangePercent", energyChangePercent
        ));
    }
    
    /**
     * Get recent sessions for dashboard
     * GET /api/sessions/recent?limit=5
     */
    @GetMapping("/recent")
    public ResponseEntity<List<SessionResponseDto>> getRecentSessions(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "5") int limit) {
        var sessions = sessionRepository.findByUserIdOrderByStartTimeDesc(userId);
        var recent = sessions.stream()
            .limit(limit)
            .map(s -> chargingService.getSessionById(s.getSessionId()))
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(recent);
    }
    
    /**
     * Mark session as paid (called by payment-service)
     * PUT /api/sessions/{id}/mark-paid?paymentId={paymentId}
     */
    @PutMapping("/{id}/mark-paid")
    public ResponseEntity<Void> markSessionAsPaid(
            @PathVariable Long id,
            @RequestParam Long paymentId) {
        chargingService.markSessionAsPaid(id, paymentId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get energy usage chart data
     * GET /api/sessions/energy-usage?period=week
     */
    @GetMapping("/energy-usage")
    public ResponseEntity<List<java.util.Map<String, Object>>> getEnergyUsageChart(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "week") String period) {
        
        var now = java.time.LocalDateTime.now();
        var sessions = sessionRepository.findByUserIdOrderByStartTimeDesc(userId)
            .stream()
            .filter(s -> s.getSessionStatus() == com.chargingservice.entities.ChargingSession.SessionStatus.completed)
            .filter(s -> s.getEndTime() != null)
            .collect(java.util.stream.Collectors.toList());
        
        List<java.util.Map<String, Object>> chartData = new java.util.ArrayList<>();
        
        if ("week".equals(period)) {
            // Last 7 days
            var dayNames = new String[]{"CN", "T2", "T3", "T4", "T5", "T6", "T7"};
            for (int i = 6; i >= 0; i--) {
                var day = now.minusDays(i);
                var dayStart = day.withHour(0).withMinute(0).withSecond(0);
                var dayEnd = day.withHour(23).withMinute(59).withSecond(59);
                
                var dayEnergy = sessions.stream()
                    .filter(s -> s.getEndTime().isAfter(dayStart) && s.getEndTime().isBefore(dayEnd))
                    .map(s -> s.getEnergyConsumed() != null ? s.getEnergyConsumed() : java.math.BigDecimal.ZERO)
                    .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                
                chartData.add(java.util.Map.of(
                    "day", dayNames[day.getDayOfWeek().getValue() % 7],
                    "usage", dayEnergy.doubleValue()
                ));
            }
        }
        
        return ResponseEntity.ok(chartData);
    }
}