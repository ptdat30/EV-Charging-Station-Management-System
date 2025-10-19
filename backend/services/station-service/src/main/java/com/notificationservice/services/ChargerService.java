// FILE: ChargerService.java
package com.notificationservice.services;

import com.notificationservice.dtos.ChargerResponseDto;
import com.notificationservice.dtos.CreateChargerRequestDto;
import com.notificationservice.dtos.UpdateChargerRequestDto;
import java.util.List;

public interface ChargerService {
    // Thêm một trụ sạc vào một trạm cụ thể
    ChargerResponseDto addChargerToStation(Long stationId, CreateChargerRequestDto requestDto);

    // Lấy thông tin một trụ sạc cụ thể
    ChargerResponseDto getChargerById(Long chargerId);

    // Lấy tất cả các trụ sạc của một trạm
    List<ChargerResponseDto> getChargersByStationId(Long stationId);

    // Cập nhật trạng thái một trụ sạc
    ChargerResponseDto updateChargerStatus(Long chargerId, UpdateChargerRequestDto requestDto);

    // Xóa một trụ sạc
    void deleteCharger(Long chargerId);
}