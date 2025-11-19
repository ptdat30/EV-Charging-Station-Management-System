package com.quitsmoking.reponsitories;
import com.quitsmoking.model.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
/**
 * Repository cho UserSettings entity
 */
@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, String> {
    /**
     * Tìm cài đặt theo user ID
     */
    @Query("SELECT us FROM UserSettings us WHERE us.user.id = :userId")
    Optional<UserSettings> findByUserId(@Param("userId") String userId);
    /**
     * Kiểm tra xem user đã có cài đặt chưa
     */
    @Query("SELECT COUNT(us) > 0 FROM UserSettings us WHERE us.user.id = :userId")
    boolean existsByUserId(@Param("userId") String userId);
    /**
     * Xóa cài đặt theo user ID
     */
    @Query("DELETE FROM UserSettings us WHERE us.user.id = :userId")
    void deleteByUserId(@Param("userId") String userId);
}