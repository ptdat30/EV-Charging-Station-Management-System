// FILE: StationServiceClient.java
package com.chargingservice.clients;

import com.chargingservice.dtos.internal.UpdateChargerStatusDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

// [COMMAND]: @FeignClient(name = "STATION-SERVICE")
// - name: Tên của service cần gọi, phải khớp chính xác với tên đã đăng ký trên Eureka Server.
// - Feign sẽ dùng Eureka để tìm địa chỉ IP và cổng của STATION-SERVICE.
@FeignClient(name = "STATION-SERVICE")
public interface StationServiceClient {

    // [COMMAND]: Định nghĩa một phương thức khớp với endpoint bên station-service.
    // PUT /api/chargers/{chargerId}
    @PutMapping("/api/chargers/{chargerId}")
    void updateChargerStatus(
            @PathVariable("chargerId") Long chargerId,
            @RequestBody UpdateChargerStatusDto requestDto);

    // GET /api/stations/{stationId}/chargers - Lấy danh sách chargers của một station
    @GetMapping("/api/stations/{stationId}/chargers")
    List<Map<String, Object>> getChargersByStationId(@PathVariable("stationId") Long stationId);
}