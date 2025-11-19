package com.quitsmoking.services; // Đảm bảo đúng package của bạn

import com.quitsmoking.dto.request.SmokingStatusRequest;
import com.quitsmoking.dto.response.SmokingStatusResponse;
import com.quitsmoking.model.SmokingStatus;
import com.quitsmoking.model.User; // Cần thiết để liên kết trạng thái với User
import com.quitsmoking.reponsitories.SmokingStatusDAO;
import com.quitsmoking.reponsitories.UserDAO; // Để tìm User
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SmokingStatusService {

    private final SmokingStatusDAO smokingStatusDAO;
    private final UserDAO userDAO; // Inject UserDAO để tìm User

    public SmokingStatusService(SmokingStatusDAO smokingStatusDAO, UserDAO userDAO) {
        this.smokingStatusDAO = smokingStatusDAO;
        this.userDAO = userDAO;
    }

    // Thêm bản ghi tình trạng hút thuốc mới
    public SmokingStatusResponse addSmokingStatus(String userId, SmokingStatusRequest request) {
        // Tìm User theo ID
        User user = userDAO.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // Kiểm tra nếu user đã có bất kỳ bản ghi nào
        List<SmokingStatus> existingStatuses = smokingStatusDAO.findByUser(user);
        if (!existingStatuses.isEmpty()) {
            throw new RuntimeException("Bạn chỉ được ghi nhận tình trạng hút thuốc 1 lần duy nhất.");
        }

        SmokingStatus newStatus = new SmokingStatus();
        newStatus.setUser(user);
        newStatus.setTobaccoType(request.getTobaccoType()); // Thêm các trường từ request
        newStatus.setTobaccoBrand(request.getTobaccoBrand());
        newStatus.setNumberOfCigarettes(request.getNumberOfCigarettes());
        newStatus.setUnit(request.getUnit());
        // newStatus.setFrequency(request.getFrequency());
        newStatus.setCostPerPack(request.getCostPerPack());
        newStatus.setSmokingDurationYears(request.getSmokingDurationYears());
        newStatus.setHealthIssue(request.getHealthIssue());
        newStatus.setRecordDate(request.getRecordDate());
        newStatus.setRecordUpdate(LocalDate.now()); // Đặt ngày cập nhật khi tạo mới

        SmokingStatus saved = smokingStatusDAO.save(newStatus);
        return toResponse(saved);
    }

    private SmokingStatusResponse toResponse(SmokingStatus status) {
        return new SmokingStatusResponse(
            status.getId(),
            status.getUser() != null ? status.getUser().getId() : null,
            status.getTobaccoType(),
            status.getTobaccoBrand(),
            status.getNumberOfCigarettes(),
            status.getUnit(),
            status.getCostPerPack(),
            status.getSmokingDurationYears(),
            status.getHealthIssue(),
            status.getRecordDate(),
            status.getRecordUpdate()
        );
    }

    // Lấy tất cả bản ghi tình trạng hút thuốc của một người dùng
    public List<SmokingStatus> getAllSmokingStatusesByUser(String userId) {
        User user = userDAO.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return smokingStatusDAO.findByUser(user);
    }

    // Lấy một bản ghi tình trạng hút thuốc theo ID
    public Optional<SmokingStatus> getSmokingStatusById(Long id) {
        return smokingStatusDAO.findById(id);
    }

    // Cập nhật bản ghi tình trạng hút thuốc
    public SmokingStatus updateSmokingStatus(Long statusId, SmokingStatusRequest request) {
        SmokingStatus existingStatus = smokingStatusDAO.findById(statusId)
                .orElseThrow(() -> new RuntimeException("Smoking status not found with ID: " + statusId));

        existingStatus.setTobaccoType(request.getTobaccoType()); // Cập nhật các trường đầy đủ
        existingStatus.setTobaccoBrand(request.getTobaccoBrand());
        existingStatus.setNumberOfCigarettes(request.getNumberOfCigarettes());
        // existingStatus.setFrequency(request.getFrequency());
        existingStatus.setUnit(request.getUnit());
        existingStatus.setCostPerPack(request.getCostPerPack());
        existingStatus.setSmokingDurationYears(request.getSmokingDurationYears());
        existingStatus.setHealthIssue(request.getHealthIssue());
        existingStatus.setRecordDate(request.getRecordDate()); // Cập nhật ngày ghi nhận nếu cần
        existingStatus.setRecordUpdate(LocalDate.now()); // Cập nhật ngày sửa đổi

        return smokingStatusDAO.save(existingStatus);
    }

    // Xóa bản ghi tình trạng hút thuốc
    public void deleteSmokingStatus(Long id) {
        smokingStatusDAO.deleteById(id);
    }
}