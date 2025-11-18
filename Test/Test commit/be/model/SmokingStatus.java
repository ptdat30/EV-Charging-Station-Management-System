package com.quitsmoking.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate; // Để lưu ngày tháng
import java.util.UUID;

@Entity
@Table(name = "smoking_status") // Tên bảng trong database
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmokingStatus {

    @Id
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "VARCHAR(36)")
    private String id;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
    }

    // Mối quan hệ Many-to-One với User
    @ManyToOne(fetch = FetchType.LAZY) // Lazy loading: chỉ load User khi cần thiết
    @JoinColumn(name = "user_id", nullable = false) // Tên cột khóa ngoại trong bảng smoking_status
    private User user; // Đối tượng User mà bản ghi này thuộc về

    @Column(name = "loaithuoc", nullable = false)
    private String tobaccoType; // cigarettes, rustic, vape

    @Column(name = "hieuthuoc") // Jet, Hero, Marlboro, Khác
    private String tobaccoBrand;

    @Column(name = "soluongdieuthuoc/ngay", nullable = false)
    private Integer numberOfCigarettes; // Số lượng điếu thuốc hút

    @Column(name = "donvi") // Gói, Gam, ML
    private String unit;

    // @Column(name = "tansuat", nullable = false)
    // private String frequency; // Tần suất hút (ví dụ: "daily", "weekly", "occasionally")

    @Column(name = "giatien/goi") // Có thể null nếu người dùng không muốn nhập
    private Double costPerPack; // Giá tiền mỗi gói thuốc (ví dụ: VND)

    @Column(name = "timedudung") // Bao nhiêu năm
    private Integer smokingDurationYears;

    @Column(name = "tinhtrangSucKhoe") // Khó thở, ho,...
    private String healthIssue;

    @Column(name = "ghinhantinhtrang", nullable = false)
    private LocalDate recordDate; // Ngày ghi nhận tình trạng

    @Column(name = "capnhattinhtrang", nullable = false)
    private LocalDate recordUpdate; // Ngày ghi nhận tình trạng

    // Có thể thêm các trường khác nếu cần thiết, ví dụ:
    // private String notes;
}