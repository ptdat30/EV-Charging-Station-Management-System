package com.quitsmoking.services; 

import com.quitsmoking.model.User;
import com.quitsmoking.model.Role;
import com.quitsmoking.reponsitories.UserDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class MembershipExpirationScheduler {

    @Autowired
    private UserDAO userDAO;

    /**
     * Tác vụ định kỳ kiểm tra các gói thành viên hết hạn và hạ cấp vai trò người dùng.
     * Chạy mỗi ngày một lần vào lúc 00:00 (nửa đêm).
     */
    @Scheduled(cron = "0 0 0 * * ?") // Cron expression: giây phút giờ ngày_trong_tháng tháng ngày_trong_tuần.
                                  // "0 0 0 * * ?" nghĩa là 0 giây, 0 phút, 0 giờ (nửa đêm) mỗi ngày.
    @Transactional
    public void checkAndDowngradeExpiredMemberships() {
        // Log để biết scheduler đang chạy
        System.out.println("Kiểm tra và hạ cấp gói thành viên hết hạn vào: " + LocalDateTime.now());

        // Lấy tất cả người dùng có role là MEMBER và gói sắp hết hạn (hoặc đã hết hạn)
        // Hoặc đơn giản hơn là lấy tất cả người dùng có membershipEndDate <= hôm nay và role là MEMBER
        List<User> members = userDAO.findByRole(Role.MEMBER);

        for (User user : members) {
            // Kiểm tra nếu gói thành viên đã hết hạn hoặc sắp hết hạn
            if (user.getMembershipEndDate() != null && user.getMembershipEndDate().isBefore(LocalDate.now())) {
                System.out.println("Gói thành viên của người dùng " + user.getEmail() + " đã hết hạn.");

                // Chuyển Role về GUEST
                user.setRole(Role.GUEST);
                user.setCurrentMembershipPlan(null); // Xóa gói hiện tại
                user.setMembershipStartDate(null); // Xóa ngày bắt đầu
                user.setMembershipEndDate(null); // Xóa ngày hết hạn

                userDAO.save(user); // Lưu các thay đổi
                System.out.println("Đã hạ cấp người dùng " + user.getEmail() + " về vai trò GUEST.");
            }
        }
         System.out.println("Hoàn tất kiểm tra và hạ cấp gói thành viên.");
    }
}