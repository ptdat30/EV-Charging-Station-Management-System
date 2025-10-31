package com.chargingservice.dtos;

import com.chargingservice.entities.ChargingSession;
import lombok.Data;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * DTO để trả về trạng thái sạc real-time
 */
@Data
public class SessionStatusDto {
    private Long sessionId;
    private ChargingSession.SessionStatus status;
    
    // SOC (State of Charge) - phần trăm pin hiện tại (0-100)
    private Double currentSOC; // 0.0 - 100.0
    
    // Thời gian còn lại ước tính (phút)
    private Integer estimatedMinutesRemaining;
    
    // Thời gian kết thúc ước tính
    private LocalDateTime estimatedEndTime;
    
    // Năng lượng đã sạc (kWh)
    private BigDecimal energyCharged; // kWh đã sạc
    
    // Năng lượng dự kiến tổng cộng (kWh)
    private BigDecimal estimatedTotalEnergy; // kWh dự kiến sạc đầy
    
    // Chi phí hiện tại (VND)
    private BigDecimal currentCost;
    
    // Chi phí ước tính tổng cộng (VND)
    private BigDecimal estimatedTotalCost;
    
    // Đơn giá (VND/kWh)
    private BigDecimal pricePerKwh;
    
    // Thời gian đã sạc (phút)
    private Long minutesElapsed;
    
    // Công suất sạc (kW)
    private BigDecimal chargingPower; // kW
}

