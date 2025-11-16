// FILE: PackageDataInitializer.java
package com.userservice.configs;

import com.userservice.entities.Package;
import com.userservice.repositories.PackageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

/**
 * Tự động tạo các gói cước cơ bản khi ứng dụng khởi động
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PackageDataInitializer implements CommandLineRunner {

    private final PackageRepository packageRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("🔄 Initializing default packages...");
        
        // Kiểm tra xem đã có packages chưa
        if (packageRepository.count() > 0) {
            log.info("✅ Packages already exist, skipping initialization");
            return;
        }

        // Tạo các gói cước cơ bản
        List<Package> defaultPackages = Arrays.asList(
            createSilverPackage(),
            createGoldPackage(),
            createPlatinumPackage()
        );

        // Lưu vào database
        for (Package pkg : defaultPackages) {
            try {
                packageRepository.save(pkg);
                log.info("✅ Created package: {} ({})", pkg.getName(), pkg.getPackageType());
            } catch (Exception e) {
                log.error("❌ Failed to create package {}: {}", pkg.getName(), e.getMessage());
            }
        }

        log.info("✅ Package initialization completed. Total packages: {}", packageRepository.count());
    }

    /**
     * Gói Bạc (Silver) - Gói cơ bản
     */
    private Package createSilverPackage() {
        Package pkg = new Package();
        pkg.setName("Gói Bạc");
        pkg.setDescription("Gói dịch vụ cơ bản dành cho người dùng mới. Phù hợp với nhu cầu sạc điện xe thông thường.");
        pkg.setPackageType(Package.PackageType.SILVER);
        pkg.setPrice(new BigDecimal("299000"));
        pkg.setDurationDays(30);
        pkg.setFeatures(Arrays.asList(
            "Sạc không giới hạn tại tất cả các trạm",
            "Ưu tiên đặt chỗ tại trạm phổ biến",
            "Hỗ trợ khách hàng 24/7",
            "Thông báo trạng thái sạc real-time"
        ));
        pkg.setDiscountPercentage(0);
        pkg.setIsActive(true);
        return pkg;
    }

    /**
     * Gói Vàng (Gold) - Gói phổ biến
     */
    private Package createGoldPackage() {
        Package pkg = new Package();
        pkg.setName("Gói Vàng");
        pkg.setDescription("Gói dịch vụ nâng cao với nhiều ưu đãi. Phù hợp cho người dùng thường xuyên sử dụng dịch vụ sạc.");
        pkg.setPackageType(Package.PackageType.GOLD);
        pkg.setPrice(new BigDecimal("599000"));
        pkg.setDurationDays(30);
        pkg.setFeatures(Arrays.asList(
            "Tất cả tính năng của Gói Bạc",
            "Giảm giá 10% cho mỗi lần sạc",
            "Ưu tiên cao hơn khi đặt chỗ",
            "Đặt trước tối đa 3 chỗ cùng lúc",
            "Truy cập vào các trạm VIP",
            "Báo cáo sử dụng chi tiết"
        ));
        pkg.setDiscountPercentage(10);
        pkg.setIsActive(true);
        return pkg;
    }

    /**
     * Gói Bạch Kim (Platinum) - Gói cao cấp
     */
    private Package createPlatinumPackage() {
        Package pkg = new Package();
        pkg.setName("Gói Bạch Kim");
        pkg.setDescription("Gói dịch vụ cao cấp nhất với đầy đủ tính năng và ưu đãi tối đa. Dành cho doanh nghiệp và người dùng VIP.");
        pkg.setPackageType(Package.PackageType.PLATINUM);
        pkg.setPrice(new BigDecimal("999000"));
        pkg.setDurationDays(30);
        pkg.setFeatures(Arrays.asList(
            "Tất cả tính năng của Gói Vàng",
            "Giảm giá 20% cho mỗi lần sạc",
            "Ưu tiên tuyệt đối khi đặt chỗ",
            "Đặt trước không giới hạn số chỗ",
            "Truy cập độc quyền các trạm Premium",
            "Hỗ trợ ưu tiên 24/7",
            "Quản lý nhiều phương tiện",
            "Báo cáo và phân tích nâng cao",
            "Dịch vụ bảo trì định kỳ"
        ));
        pkg.setDiscountPercentage(20);
        pkg.setIsActive(true);
        return pkg;
    }
}

