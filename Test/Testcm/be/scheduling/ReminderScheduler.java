package com.quitsmoking.scheduling;

import com.quitsmoking.model.User;
import com.quitsmoking.model.Role;
import com.quitsmoking.reponsitories.UserRepository;
import com.quitsmoking.services.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class ReminderScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ReminderScheduler.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // Gửi nhắc nhở hàng ngày vào lúc 0 giờ 30 phút sáng (00:30 AM)
    @Scheduled(cron = "0 30 0 * * *")
    public void sendDailyReminders() {
        logger.info("Running daily reminder task...");
        // Lấy tất cả người dùng có gói thành viên
        List<User> allActiveUsers = userRepository.findByCurrentMembershipPlanIsNotNull();

        for (User user : allActiveUsers) {
            // Kiểm tra user có vai trò là MEMBER và các điều kiện khác
            if (user.getRole() == Role.MEMBER && user.getCurrentMembershipPlan() != null && user.getMembershipStartDate() != null) {
                String subject = "Một Ngày Mới, Một Cuộc Sống Khỏe Mạnh Hơn - QuitSmoking";
                String body = String.format(
                        "Chào %s,\n\n" +
                                "Mỗi ngày là một món quà, một cơ hội để bạn chọn cuộc sống không khói thuốc lá. " +
                                "Hãy cảm nhận nguồn năng lượng mới và sự tự do đang lớn dần trong cơ thể bạn. " +
                                "Gia đình và tương lai tươi sáng đang chờ đợi bạn phía trước. " +
                                "Chúng tôi tự hào về nỗ lực của bạn và luôn ở đây để đồng hành cùng bạn trên con đường hướng tới sức khỏe trọn vẹn!\n\n" +
                                "Bạn đang làm rất tốt!\n\n" +
                                "Trân trọng,\n" +
                                "Đội ngũ QuitSmoking",
                        user.getFirstName()
                );
                try {
                    emailService.sendEmail(user.getEmail(), subject, body);
                    logger.info("Gửi nhắc nhở hàng ngày cho: {}", user.getEmail());
                } catch (Exception e) {
                    logger.error("Lỗi khi gửi nhắc nhở hàng ngày cho {}: {}", user.getEmail(), e.getMessage(), e);
                }
            }
        }
    }

    // Gửi nhắc nhở hàng tuần vào mỗi Chủ Nhật lúc 9:00 sáng
    @Scheduled(cron = "0 0 9 ? * SUN")
    public void sendWeeklyReminders() {
        logger.info("Running weekly reminder task...");
        // Lấy tất cả người dùng có gói thành viên
        List<User> allActiveUsers = userRepository.findByCurrentMembershipPlanIsNotNull();
        LocalDate today = LocalDate.now();

        for (User user : allActiveUsers) {
            // Kiểm tra user có vai trò là MEMBER và các điều kiện khác
            if (user.getRole() == Role.MEMBER && user.getCurrentMembershipPlan() != null && user.getMembershipStartDate() != null) {
                long daysSinceStart = ChronoUnit.DAYS.between(user.getMembershipStartDate(), today);

                if (daysSinceStart > 0 && daysSinceStart % 7 == 0) {
                    String subject = "Chúc Mừng Một Tuần Không Khói Thuốc Tuyệt Vời! - QuitSmoking";
                    String body = String.format(
                            "Chào %s,\n\n" +
                                    "Bạn đã thêm một tuần nữa vào hành trình vĩ đại hướng tới sức khỏe và hạnh phúc! " +
                                    "Hãy nhìn lại những ngày qua, bạn đã chiến thắng sự thèm muốn và bảo vệ bản thân cùng những người thân yêu. " +
                                    "Mỗi hơi thở trong lành bạn hít vào là một món quà cho cơ thể và một lời hứa cho một tương lai không bệnh tật. " +
                                    "Gia đình bạn chắc chắn rất tự hào về sự kiên cường này.\n\n" +
                                    "Hãy tiếp tục vững bước trên con đường hướng tới cuộc sống trọn vẹn nhé!\n\n" +
                                    "Trân trọng,\n" +
                                    "Đội ngũ QuitSmoking",
                            user.getFirstName()
                    );
                    try {
                        emailService.sendEmail(user.getEmail(), subject, body);
                        logger.info("Gửi nhắc nhở hàng tuần cho: {}", user.getEmail());
                    } catch (Exception e) {
                        logger.error("Lỗi khi gửi nhắc nhở hàng tuần cho {}: {}", user.getEmail(), e.getMessage(), e);
                    }
                }
            }
        }
    }

    // Gửi nhắc nhở hàng tháng vào ngày mùng 1 hàng tháng lúc 10:00 sáng
    @Scheduled(cron = "0 0 10 1 * ?")
    public void sendMonthlyReminders() {
        logger.info("Running monthly reminder task...");
        // Lấy tất cả người dùng có gói thành viên
        List<User> allActiveUsers = userRepository.findByCurrentMembershipPlanIsNotNull();
        LocalDate today = LocalDate.now();

        for (User user : allActiveUsers) {
            // Kiểm tra user có vai trò là MEMBER và các điều kiện khác
            if (user.getRole() == Role.MEMBER && user.getCurrentMembershipPlan() != null && user.getMembershipStartDate() != null) {
                long monthsSinceStart = ChronoUnit.MONTHS.between(user.getMembershipStartDate(), today);

                if (monthsSinceStart > 0 && today.getDayOfMonth() == user.getMembershipStartDate().getDayOfMonth()) {
                    String subject = "Chúc Mừng Một Tháng Sống Khỏe Mạnh! - QuitSmoking";
                    String body = String.format(
                            "Chào %s,\n\n" +
                                    "Một tháng nữa đã trôi qua, và bạn đã đạt được một cột mốc quan trọng trên hành trình cai thuốc lá! " +
                                    "Bạn không chỉ thay đổi cuộc sống của mình mà còn là tấm gương sáng cho gia đình và bạn bè. " +
                                    "Hãy tưởng tượng một tương lai tràn đầy sức sống, nơi bạn có thể tận hưởng mọi khoảnh khắc bên những người thân yêu mà không bị ràng buộc bởi thuốc lá. " +
                                    "Mỗi ngày không hút thuốc là một sự đầu tư vào sức khỏe và hạnh phúc bền vững của bạn.\n\n" +
                                    "Hãy tiếp tục kiên định và xây dựng một tương lai rạng rỡ nhé!\n\n" +
                                    "Trân trọng,\n" +
                                    "Đội ngũ QuitSmoking",
                            user.getFirstName()
                    );
                    try {
                        emailService.sendEmail(user.getEmail(), subject, body);
                        logger.info("Gửi nhắc nhở hàng tháng cho: {}", user.getEmail());
                    } catch (Exception e) {
                        logger.error("Lỗi khi gửi nhắc nhở hàng tháng cho {}: {}", user.getEmail(), e.getMessage(), e);
                    }
                }
            }
        }
    }
}
