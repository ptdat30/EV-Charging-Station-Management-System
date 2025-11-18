package com.quitsmoking.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DailyProgressRequest {
    private Integer mood;
    private Integer cravings;
    private Boolean exercise;
    private Integer water;
    private Integer sleep;
    private String note;
    private Boolean smokedToday;
    private Integer cigarettesToday;
    private BigDecimal moneySpentToday;
    private LocalDate date; // optional, nếu muốn cho phép cập nhật ngày bất kỳ

    // Getters and Setters
    public Integer getMood() { return mood; }
    public void setMood(Integer mood) { this.mood = mood; }

    public Integer getCravings() { return cravings; }
    public void setCravings(Integer cravings) { this.cravings = cravings; }

    public Boolean getExercise() { return exercise; }
    public void setExercise(Boolean exercise) { this.exercise = exercise; }

    public Integer getWater() { return water; }
    public void setWater(Integer water) { this.water = water; }

    public Integer getSleep() { return sleep; }
    public void setSleep(Integer sleep) { this.sleep = sleep; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Boolean getSmokedToday() { return smokedToday; }
    public void setSmokedToday(Boolean smokedToday) { this.smokedToday = smokedToday; }

    public Integer getCigarettesToday() { return cigarettesToday; }
    public void setCigarettesToday(Integer cigarettesToday) { this.cigarettesToday = cigarettesToday; }

    public BigDecimal getMoneySpentToday() { return moneySpentToday; }
    public void setMoneySpentToday(BigDecimal moneySpentToday) { this.moneySpentToday = moneySpentToday; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
} 