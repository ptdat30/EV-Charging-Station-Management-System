package com.quitsmoking.reponsitories;
import com.quitsmoking.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface AchievementRepository extends JpaRepository<Achievement, String> {
    
    List<Achievement> findByCriteriaType(Achievement.CriteriaType criteriaType);
    
    List<Achievement> findByCriteriaTypeAndCriteriaValueLessThanEqual(
        Achievement.CriteriaType criteriaType, int value);
}
