// FILE: ChargingService.java
package com.chargingservice.services;

import com.chargingservice.dtos.SessionResponseDto;
import com.chargingservice.dtos.StartSessionRequestDto;

public interface ChargingService {
    /**
     * Bắt đầu một phiên sạc mới dựa trên thông tin từ người dùng.
     * @param requestDto Dữ liệu đầu vào chứa userId, stationId, và chargerId.
     * @return Thông tin chi tiết của phiên sạc vừa được tạo.
     */
    SessionResponseDto startSession(StartSessionRequestDto requestDto);
}