package com.quitsmoking.reponsitories;

import com.quitsmoking.model.DashboardShare;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DashboardShareRepository extends JpaRepository<DashboardShare, String> {
    List<DashboardShare> findByCoachId(String coachId);
    List<DashboardShare> findByMemberId(String memberId);
    boolean existsByMemberIdAndCoachId(String memberId, String coachId);
    void deleteByMemberIdAndCoachId(String memberId, String coachId);
}