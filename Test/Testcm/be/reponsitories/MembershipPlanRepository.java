package com.quitsmoking.reponsitories;

// Trong file com.quitsmoking.reponsitories.MembershipPlanRepository.java
import com.quitsmoking.model.MembershipPlan; // <-- Thay đổi chỗ này
import com.quitsmoking.model.MembershipPlanType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, String> { // <-- Thay đổi chỗ này
    // Các phương thức sau phải trả về MembershipPlan (entity)
    List<MembershipPlan> findByIsActiveTrue();

    Optional<MembershipPlan> findByPlanName(String planName);

    Optional<MembershipPlan> findByPlanType(MembershipPlanType planType);

    List<MembershipPlan> findByPriceBetweenAndIsActiveTrue(Double minPrice, Double maxPrice);

    // Chú ý: durationDays chứ không phải durationMonths (trong entity là durationDays)
    List<MembershipPlan> findByDurationDaysAndIsActiveTrue(Integer durationDays); // <-- Sửa tên phương thức nếu cần

    List<MembershipPlan> findByPriceOrderByPriceAsc(Double price);

    List<MembershipPlan> findAllByOrderByPriceAsc();
}
