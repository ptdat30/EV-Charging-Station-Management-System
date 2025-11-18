package com.quitsmoking.controllers;

import com.quitsmoking.dto.request.SmokingStatusRequest;
import com.quitsmoking.dto.response.SmokingStatusResponse;
import com.quitsmoking.model.SmokingStatus;
import com.quitsmoking.services.SmokingStatusService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/smoking-status") // Base URL cho API này
@CrossOrigin(origins = "*")
public class SmokingStatusController {

    private final SmokingStatusService smokingStatusService;

    public SmokingStatusController(SmokingStatusService smokingStatusService) {
        this.smokingStatusService = smokingStatusService;
    }

    // Endpoint để thêm tình trạng hút thuốc mới
    // userId có thể được lấy từ JWT/Spring Security Context thay vì truyền qua PathVariable
    @PostMapping("/user/{userId}")
    public ResponseEntity<?> addSmokingStatus(@PathVariable String userId,
                                              @RequestBody SmokingStatusRequest request) {
        try {
            SmokingStatusResponse newStatus = smokingStatusService.addSmokingStatus(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(newStatus);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to add smoking status: " + e.getMessage());
        }
    }

    // Endpoint để lấy tất cả tình trạng hút thuốc của một người dùng (chuẩn REST, dùng cho frontend kiểm tra đã ghi nhận chưa)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SmokingStatusResponse>> getSmokingStatusesByUser(@PathVariable String userId) {
        try {
            List<SmokingStatus> statuses = smokingStatusService.getAllSmokingStatusesByUser(userId);
            List<SmokingStatusResponse> response = statuses.stream().map(status -> new SmokingStatusResponse(
                status.getId(),
                status.getUser().getId(),
                status.getTobaccoType(),
                status.getTobaccoBrand(),
                status.getNumberOfCigarettes(),
                status.getUnit(),
                status.getCostPerPack(),
                status.getSmokingDurationYears(),
                status.getHealthIssue(),
                status.getRecordDate(),
                status.getRecordUpdate()
            )).toList();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoint để lấy một tình trạng hút thuốc theo ID
    @GetMapping("/{statusId}")
    public ResponseEntity<SmokingStatus> getSmokingStatusById(@PathVariable Long statusId) {
        return smokingStatusService.getSmokingStatusById(statusId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint để cập nhật tình trạng hút thuốc
    @PutMapping("/{statusId}")
    public ResponseEntity<?> updateSmokingStatus(@PathVariable Long statusId,
                                                 @RequestBody SmokingStatusRequest request) {
        try {
            SmokingStatus updatedStatus = smokingStatusService.updateSmokingStatus(statusId, request);
            return ResponseEntity.ok(updatedStatus);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update smoking status: " + e.getMessage());
        }
    }

    // Endpoint để xóa tình trạng hút thuốc
    @DeleteMapping("/{statusId}")
    public ResponseEntity<Void> deleteSmokingStatus(@PathVariable Long statusId) {
        try {
            smokingStatusService.deleteSmokingStatus(statusId);
            return ResponseEntity.noContent().build(); // Trả về 204 No Content
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}