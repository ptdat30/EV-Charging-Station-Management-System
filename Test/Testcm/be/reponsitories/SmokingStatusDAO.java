package com.quitsmoking.reponsitories;

import com.quitsmoking.model.SmokingStatus;
import com.quitsmoking.model.User; // Cần import User để dùng trong tìm kiếm
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository thao tác với bảng smoking_status.
 */
@Repository
public interface SmokingStatusDAO extends JpaRepository<SmokingStatus, Long> {

    // Tìm tất cả tình trạng hút thuốc của một user
    List<SmokingStatus> findByUser(User user);

    // Phương thức tùy chỉnh để tìm bản ghi tình trạng hút thuốc của một User theo ngày
    
    Optional<SmokingStatus> findByUserAndRecordDate(User user, LocalDate recordDate);

    // Bạn có thể thêm các phương thức tìm kiếm khác theo nhu cầu
    // List<SmokingStatus> findByUserOrderByRecordDateDesc(User user); // Sắp xếp theo ngày giảm dần
}