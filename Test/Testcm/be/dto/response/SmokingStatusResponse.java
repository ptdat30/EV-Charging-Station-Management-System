package com.quitsmoking.dto.response;

import java.time.LocalDate;

public class SmokingStatusResponse {
    private String id;
    private String userId;
    private String tobaccoType;
    private String tobaccoBrand;
    private Integer numberOfCigarettes;
    private String unit;
    private Double costPerPack;
    private Integer smokingDurationYears;
    private String healthIssue;
    private LocalDate recordDate;
    private LocalDate recordUpdate;

    // Constructors
    public SmokingStatusResponse() {}

    public SmokingStatusResponse(String id, String userId, String tobaccoType, String tobaccoBrand, Integer numberOfCigarettes, String unit, Double costPerPack, Integer smokingDurationYears, String healthIssue, LocalDate recordDate, LocalDate recordUpdate) {
        this.id = id;
        this.userId = userId;
        this.tobaccoType = tobaccoType;
        this.tobaccoBrand = tobaccoBrand;
        this.numberOfCigarettes = numberOfCigarettes;
        this.unit = unit;
        this.costPerPack = costPerPack;
        this.smokingDurationYears = smokingDurationYears;
        this.healthIssue = healthIssue;
        this.recordDate = recordDate;
        this.recordUpdate = recordUpdate;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getTobaccoType() { return tobaccoType; }
    public void setTobaccoType(String tobaccoType) { this.tobaccoType = tobaccoType; }
    public String getTobaccoBrand() { return tobaccoBrand; }
    public void setTobaccoBrand(String tobaccoBrand) { this.tobaccoBrand = tobaccoBrand; }
    public Integer getNumberOfCigarettes() { return numberOfCigarettes; }
    public void setNumberOfCigarettes(Integer numberOfCigarettes) { this.numberOfCigarettes = numberOfCigarettes; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public Double getCostPerPack() { return costPerPack; }
    public void setCostPerPack(Double costPerPack) { this.costPerPack = costPerPack; }
    public Integer getSmokingDurationYears() { return smokingDurationYears; }
    public void setSmokingDurationYears(Integer smokingDurationYears) { this.smokingDurationYears = smokingDurationYears; }
    public String getHealthIssue() { return healthIssue; }
    public void setHealthIssue(String healthIssue) { this.healthIssue = healthIssue; }
    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }
    public LocalDate getRecordUpdate() { return recordUpdate; }
    public void setRecordUpdate(LocalDate recordUpdate) { this.recordUpdate = recordUpdate; }
} 