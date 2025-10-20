// FILE: ChargerService.java
package com.userservice.services;

import com.userservice.dtos.ChargerResponseDto;
import com.userservice.dtos.CreateChargerRequestDto;
import com.userservice.dtos.UpdateChargerRequestDto;
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