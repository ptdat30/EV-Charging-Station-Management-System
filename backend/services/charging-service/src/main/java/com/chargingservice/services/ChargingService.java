// ===============================================================
// FILE: ChargingService.java (Phiên bản cập nhật)
// PACKAGE: com.chargingservice.services
// ===============================================================
package com.chargingservice.services;

import com.chargingservice.dtos.SessionResponseDto;
import com.chargingservice.dtos.StartSessionRequestDto;
import java.util.List;

public interface ChargingService {

    // --- CREATE ---
    SessionResponseDto startSession(StartSessionRequestDto requestDto);

    // --- UPDATE ---
    /**
     * Dừng một phiên sạc đang diễn ra.
     * @param sessionId ID của phiên sạc cần dừng.
     * @return Thông tin chi tiết của phiên sạc đã hoàn thành.
     */
    SessionResponseDto stopSession(Long sessionId);

    /**
     * Hủy một phiên sạc (ví dụ: người dùng hủy đặt chỗ hoặc hủy sạc).
     * @param sessionId ID của phiên sạc cần hủy.
     * @return Thông tin chi tiết của phiên sạc đã bị hủy.
     */
    SessionResponseDto cancelSession(Long sessionId);

    // --- READ ---
    /**
     * Lấy thông tin chi tiết của một phiên sạc.
     * @param sessionId ID của phiên sạc.
     * @return Thông tin chi tiết của phiên sạc.
     */
    SessionResponseDto getSessionById(Long sessionId);

    /**
     * Lấy danh sách tất cả các phiên sạc.
     * @return Danh sách các phiên sạc.
     */
    List<SessionResponseDto> getAllSessions();
    
    /**
     * Lấy trạng thái sạc real-time (SOC %, thời gian còn lại, chi phí)
     * @param sessionId ID của phiên sạc
     * @return Trạng thái sạc chi tiết
     */
    com.chargingservice.dtos.SessionStatusDto getSessionStatus(Long sessionId);
}