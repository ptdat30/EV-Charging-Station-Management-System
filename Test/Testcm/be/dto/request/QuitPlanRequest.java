package com.quitsmoking.dto.request;

import java.time.LocalDate;

public class QuitPlanRequest {
    private String reason;
    private LocalDate startDate;
    private LocalDate targetQuitDate;
    private String initialSmokingHabit;
    private Double pricePerPack; // Trường mới
    private String selectedReasonsJson; // Trường mới
    private String selectedTriggersJson; // Trường mới
    private String quittingPhases;

    // Có thể thêm một trường để xác định đây có phải là kế hoạch kích hoạt ngay không,
    // hoặc logic đó sẽ được xử lý trong service.

    // Constructor mặc định
    public QuitPlanRequest() {}

    // Constructor với tất cả các trường
    public QuitPlanRequest(String reason, LocalDate startDate, LocalDate targetQuitDate,
                           String initialSmokingHabit, Double pricePerPack,
                           String selectedReasonsJson, String selectedTriggersJson,
                           String quittingPhases) {
        this.reason = reason;
        this.startDate = startDate;
        this.targetQuitDate = targetQuitDate;
        this.initialSmokingHabit = initialSmokingHabit;
        this.pricePerPack = pricePerPack;
        this.selectedReasonsJson = selectedReasonsJson;
        this.selectedTriggersJson = selectedTriggersJson;
        this.quittingPhases = quittingPhases;
    }

    // Getters and Setters
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

    // Getter và Setter cho pricePerPack
    public Double getPricePerPack() {
        return pricePerPack;
    }

    public void setPricePerPack(Double pricePerPack) {
        this.pricePerPack = pricePerPack;
    }

    // Getter và Setter cho selectedReasonsJson
    public String getSelectedReasonsJson() {
        return selectedReasonsJson;
    }

    public void setSelectedReasonsJson(String selectedReasonsJson) {
        this.selectedReasonsJson = selectedReasonsJson;
    }

    // Getter và Setter cho selectedTriggersJson
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
}
