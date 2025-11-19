package com.quitsmoking.services;

import com.quitsmoking.dto.request.QuitPlanRequest;
import com.quitsmoking.dto.response.QuitPlanResponse;
import com.quitsmoking.model.QuitPlan;
import com.quitsmoking.model.User;
import com.quitsmoking.reponsitories.QuitPlanDAO;
import com.quitsmoking.reponsitories.UserDAO;
// import com.quitsmoking.dto.request.QuitPlanRequest;
// import com.quitsmoking.dto.response.QuitPlanResponse;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuitPlanService {

    private final QuitPlanDAO quitPlanDAO;
    private final UserDAO userDAO;

    public QuitPlanService(QuitPlanDAO quitPlanDAO, UserDAO userDAO) {
        this.quitPlanDAO = quitPlanDAO;
        this.userDAO = userDAO;
    }

    //
    // Tạo Kế Hoạch Cai Thuốc Mới
    //
    @Transactional
    public QuitPlanResponse createQuitPlan(String username, QuitPlanRequest request) {
        // Tìm người dùng bằng username
        User user = userDAO.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));

        // Vô hiệu hóa bất kỳ kế hoạch đang hoạt động hiện có nào của người dùng này
        Optional<QuitPlan> existingActivePlan = quitPlanDAO.findByUserAndActiveTrue(user);
        existingActivePlan.ifPresent(plan -> {
            plan.setActive(false);
            quitPlanDAO.save(plan);
        });
        String selectedReasonsJsonToSave = request.getSelectedReasonsJson();
        if (selectedReasonsJsonToSave == null || selectedReasonsJsonToSave.trim().isEmpty()) {
        selectedReasonsJsonToSave = "[]"; // Phòng thủ: mặc định là mảng JSON rỗng
        }

        String selectedTriggersJsonToSave = request.getSelectedTriggersJson();
        if (selectedTriggersJsonToSave == null || selectedTriggersJsonToSave.trim().isEmpty()) {
        selectedTriggersJsonToSave = "[]"; // Phòng thủ: mặc định là mảng JSON rỗng
        }

        // Tạo kế hoạch mới từ request DTO
        QuitPlan newPlan = new QuitPlan(
                user,
                request.getReason(),
                request.getStartDate(),
                request.getTargetQuitDate(),
                request.getInitialSmokingHabit(),
                request.getQuittingPhases(),         // <--- Đưa quittingPhases lên đây
                request.getSelectedTriggersJson(),   // <--- Giữ nguyên vị trí
                request.getSelectedReasonsJson(),    // <--- Giữ nguyên vị trí
                request.getPricePerPack()            // <--- Đưa pricePerPack xuống cuối
        );
        newPlan.setActive(true); // Đảm bảo kế hoạch mới là active

        QuitPlan savedPlan = quitPlanDAO.save(newPlan);

        return convertToResponse(savedPlan);
    }

    //
    // Lấy Kế Hoạch Cai Thuốc Đang Hoạt Động
    //
    public Optional<QuitPlanResponse> getActiveQuitPlan(String username) {
        User user = userDAO.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
        return quitPlanDAO.findByUserAndActiveTrue(user)
                .map(this::convertToResponse);
    }

    //
    // Lấy Tất Cả Kế Hoạch Cai Thuốc Của Người Dùng
    //
    public List<QuitPlanResponse> getAllQuitPlansForUser(String username) {
        User user = userDAO.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
        List<QuitPlan> plans = quitPlanDAO.findByUser(user);
        return plans.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    //
    // Cập Nhật Kế Hoạch Cai Thuốc
    //
    @Transactional
    public QuitPlanResponse updateQuitPlan(String planId, String username, QuitPlanRequest request) {
        User user = userDAO.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));

        QuitPlan existingPlan = quitPlanDAO.findById(planId)
                .orElseThrow(() -> new QuitPlanNotFoundException("Quit Plan not found with ID: " + planId));

        // Đảm bảo người dùng hiện tại là chủ sở hữu của kế hoạch
        if (!existingPlan.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("User is not authorized to update this quit plan.");
        }

        // Cập nhật thông tin từ request DTO, bao gồm các trường mới
        existingPlan.setReason(request.getReason());
        existingPlan.setStartDate(request.getStartDate());
        existingPlan.setTargetQuitDate(request.getTargetQuitDate());
        existingPlan.setInitialSmokingHabit(request.getInitialSmokingHabit());
        existingPlan.setPricePerPack(request.getPricePerPack());
        existingPlan.setSelectedReasonsJson(request.getSelectedReasonsJson());
        existingPlan.setSelectedTriggersJson(request.getSelectedTriggersJson());
        existingPlan.setQuittingPhases(request.getQuittingPhases());

        // Lưu và trả về response
        QuitPlan updatedPlan = quitPlanDAO.save(existingPlan);
        return convertToResponse(updatedPlan);
    }

    //
    // Xóa Kế Hoạch Cai Thuốc
    //
    @Transactional
    public void deleteQuitPlan(String planId, String username) {
        User user = userDAO.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));

        QuitPlan planToDelete = quitPlanDAO.findById(planId)
                .orElseThrow(() -> new QuitPlanNotFoundException("Quit Plan not found with ID: " + planId));

        // Đảm bảo người dùng hiện tại là chủ sở hữu của kế hoạch
        if (!planToDelete.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("User is not authorized to delete this quit plan.");
        }
        quitPlanDAO.delete(planToDelete);
    }

    //
    // Phương Thức Hỗ Trợ: Chuyển Đổi Entity Sang Response DTO
    //
    private QuitPlanResponse convertToResponse(QuitPlan plan) {
        // Đây là nơi bạn ánh xạ tất cả các trường từ QuitPlan entity sang QuitPlanResponse DTO.
        // Đảm bảo constructor của QuitPlanResponse cũng đã được cập nhật để nhận tất cả các trường này.
        return new QuitPlanResponse(
                plan.getId(),
                plan.getUser().getId(),
                plan.getReason(),
                plan.getStartDate(),
                plan.getTargetQuitDate(),
                plan.getInitialSmokingHabit(),
                plan.getPricePerPack(),
                plan.getSelectedReasonsJson(),
                plan.getSelectedTriggersJson(),
                plan.getQuittingPhases(),
                plan.isActive()
        );
    }

    // Bạn sẽ cần tạo các lớp ngoại lệ này để mã hoạt động:
    // Ví dụ: Đặt các lớp này trong một package riêng biệt, ví dụ: `com.quitsmoking.exceptions`
    public static class UserNotFoundException extends RuntimeException {
        public UserNotFoundException(String message) {
            super(message);
        }
    }

    public static class QuitPlanNotFoundException extends RuntimeException {
        public QuitPlanNotFoundException(String message) {
            super(message);
        }
    }

    public static class UnauthorizedAccessException extends RuntimeException {
        public UnauthorizedAccessException(String message) {
            super(message);
        }
    }
}
