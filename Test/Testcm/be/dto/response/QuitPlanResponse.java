package com.quitsmoking.dto.response;

import java.time.LocalDate;

public class QuitPlanResponse {
    private String id;
    private String userId; // ID của người dùng sở hữu kế hoạch
    private String reason;
    private LocalDate startDate;
    private LocalDate targetQuitDate;
    private String initialSmokingHabit;
    private Double pricePerPack; // Trường mới được thêm
    private String selectedReasonsJson; // Trường mới được thêm
    private String selectedTriggersJson; // Trường mới được thêm
    private String quittingPhases;
    private boolean active;

    // Constructor đã được cập nhật để bao gồm các trường mới
    public QuitPlanResponse(String id, String userId, String reason, LocalDate startDate,
                            LocalDate targetQuitDate, String initialSmokingHabit,
                            Double pricePerPack, String selectedReasonsJson, // Thêm các tham số mới
                            String selectedTriggersJson, String quittingPhases, boolean active) {
        this.id = id;
        this.userId = userId;
        this.reason = reason;
        this.startDate = startDate;
        this.targetQuitDate = targetQuitDate;
        this.initialSmokingHabit = initialSmokingHabit;
        this.pricePerPack = pricePerPack; // Gán giá trị
        this.selectedReasonsJson = selectedReasonsJson; // Gán giá trị
        this.selectedTriggersJson = selectedTriggersJson; // Gán giá trị
        this.quittingPhases = quittingPhases;
        this.active = active;
    }

    // Getters and Setters (đã thêm cho các trường mới)
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getTargetQuitDate() {
        return targetQuitDate;
    }

    public void setTargetQuitDate(LocalDate targetQuitDate) {
        this.targetQuitDate = targetQuitDate;
    }

    public String getInitialSmokingHabit() {
        return initialSmokingHabit;
    }

    public void setInitialSmokingHabit(String initialSmokingHabit) {
        this.initialSmokingHabit = initialSmokingHabit;
    }

    // Getters and Setters cho pricePerPack
    public Double getPricePerPack() {
        return pricePerPack;
    }

    public void setPricePerPack(Double pricePerPack) {
        this.pricePerPack = pricePerPack;
    }

    // Getters and Setters cho selectedReasonsJson
    public String getSelectedReasonsJson() {
        return selectedReasonsJson;
    }

    public void setSelectedReasonsJson(String selectedReasonsJson) {
        this.selectedReasonsJson = selectedReasonsJson;
    }

    // Getters and Setters cho selectedTriggersJson
    public String getSelectedTriggersJson() {
        return selectedTriggersJson;
    }

    public void setSelectedTriggersJson(String selectedTriggersJson) {
        this.selectedTriggersJson = selectedTriggersJson;
    }

    public String getQuittingPhases() {
        return quittingPhases;
    }

    public void setQuittingPhases(String quittingPhases) {
        this.quittingPhases = quittingPhases;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
