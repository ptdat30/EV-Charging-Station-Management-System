package com.quitsmoking.reponsitories;

import com.quitsmoking.model.Feedback;
import com.quitsmoking.model.User; // Import User
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    // Spring Data JPA sẽ tự động cung cấp các phương thức CRUD cơ bản
    // Bạn có thể thêm các phương thức tìm kiếm tùy chỉnh nếu cần, ví dụ:
    // List<Feedback> findByRating(Integer rating);
    // List<Feedback> findBySubmissionTimeBetween(Instant start, Instant end);
        // Phương thức để tìm Feedback theo User
    Optional<Feedback> findByUser(User user);
    
    // Phương thức để lấy tất cả feedback với user được fetch eagerly
    @Query("SELECT f FROM Feedback f LEFT JOIN FETCH f.user")
    Page<Feedback> findAllWithUser(Pageable pageable);
}
