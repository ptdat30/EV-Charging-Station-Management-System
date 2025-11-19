package com.quitsmoking.reponsitories;
import com.quitsmoking.model.DailyProgress;
import com.quitsmoking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
@Repository
public interface DailyProgressRepository extends JpaRepository<DailyProgress, String> {
    
    Optional<DailyProgress> findByUserAndDate(User user, LocalDate date);
    
    List<DailyProgress> findByUserOrderByDateDesc(User user);
    
    List<DailyProgress> findByUserAndDateBetweenOrderByDate(User user, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT SUM(dp.cigarettesSmoked) FROM DailyProgress dp WHERE dp.user = :user")
    Long getTotalCigarettesSmoked(@Param("user") User user);
    
    @Query("SELECT SUM(dp.moneySaved) FROM DailyProgress dp WHERE dp.user = :user")
    Double getTotalMoneySaved(@Param("user") User user);
    
    @Query("SELECT COUNT(dp) FROM DailyProgress dp WHERE dp.user = :user AND dp.cigarettesSmoked = 0")
    Long getSmokeFreeDays(@Param("user") User user);
    
    @Query("SELECT dp FROM DailyProgress dp WHERE dp.user = :user AND dp.date >= :startDate ORDER BY dp.date DESC")
    List<DailyProgress> findRecentProgress(@Param("user") User user, @Param("startDate") LocalDate startDate);
}
