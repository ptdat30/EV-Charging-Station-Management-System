package com.quitsmoking.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate; // Để nhận ngày từ client

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmokingStatusRequest {
    // Không cần userId ở đây, sẽ lấy từ thông tin xác thực của người dùng hiện tại
    private Integer numberOfCigarettes;
    // private String frequency;
    private String tobaccoType; // cigarettes, rustic, vape
    private String tobaccoBrand; // Jet, Hero, Marlboro, Khác
    private String unit; // Gói, Gam, ML
    private Integer smokingDurationYears;
    private String healthIssue; //Tinh trang suc khoe
    private Double costPerPack;
    private LocalDate recordDate; // Client gửi ngày ghi nhận
    private LocalDate recorUpdate;
}
