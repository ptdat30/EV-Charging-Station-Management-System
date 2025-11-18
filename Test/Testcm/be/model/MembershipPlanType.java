package com.quitsmoking.model;

public enum MembershipPlanType {
    // Thời hạn được tính bằng số ngày
    THIRTY_DAYS_TRIAL("30-day Trial", 30, 0), 
    THIRTY_DAYS("30-day Plan", 30, 1),       
    SIXTY_DAYS("60-day Plan", 60, 2),        
    NINETY_DAYS("90-day Plan", 90, 3); 

    private final String displayName;
    private final int durationDays;
    private final int priority;

    MembershipPlanType(String displayName, int durationDays, int priority) {
        this.displayName = displayName;
        this.durationDays = durationDays;
        this.priority = priority;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public int getPriority() {
        return priority;
    }
}
