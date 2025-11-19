package com.quitsmoking.services;

import com.quitsmoking.model.MembershipPlanType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Service cho MembershipPlan enum
 * Vì MembershipPlan là enum, không cần repository để lưu trữ
 */
@Service
@Transactional
public class MembershipPlanService {
    
    /**
     * Lấy tất cả gói thành viên (enum values)
     */
    public List<MembershipPlanType> getAllActivePlans() {
        return Arrays.asList(MembershipPlanType.values());
    }
    
    /**
     * Lấy tất cả gói thành viên
     */
    public List<MembershipPlanType> getAllPlans() {
        return Arrays.asList(MembershipPlanType.values());
    }
    
    /**
     * Tìm plan theo tên enum
     */
    public Optional<MembershipPlanType> getPlanById(String id) {
        try {
            return Optional.of(MembershipPlanType.valueOf(id));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }
    
    /**
     * Tìm plan theo display name
     */
    public Optional<MembershipPlanType> getPlanByName(String planName) {
        return Arrays.stream(MembershipPlanType.values())
                .filter(plan -> plan.getDisplayName().equals(planName) || plan.name().equals(planName))
                .findFirst();
    }
    
    /**
     * Lấy plans theo duration (số ngày)
     */
    public List<MembershipPlanType> getPlansByDuration(Integer durationDays) {
        return Arrays.stream(MembershipPlanType.values())
                .filter(plan -> plan.getDurationDays() == durationDays)
                .toList();
    }
}
