package com.quitsmoking.reponsitories;

import com.quitsmoking.model.QuitPlan;
import com.quitsmoking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface QuitPlanDAO extends JpaRepository<QuitPlan, String> {
    // Tìm tất cả các kế hoạch cai thuốc của một người dùng cụ thể
    List<QuitPlan> findByUser(User user);

    // Tìm kế hoạch cai thuốc đang hoạt động của một người dùng
    Optional<QuitPlan> findByUserAndActiveTrue(User user);
}
