/**
 * Script để tạo sẵn các gói cước cơ bản
 * 
 * Usage:
 *   node scripts/seed-packages.js
 * 
 * Hoặc với base URL khác:
 *   BASE_URL=http://localhost:8080 node scripts/seed-packages.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

const defaultPackages = [
    {
        packageName: 'Gói Trả Trước Cơ Bản',
        description: 'Gói dịch vụ trả trước cơ bản dành cho người dùng mới. Phù hợp với nhu cầu sạc điện xe thông thường.',
        packageType: 'PREPAID',
        price: 299000,
        durationDays: 30,
        features: [
            'Sạc không giới hạn tại tất cả các trạm',
            'Ưu tiên đặt chỗ tại trạm phổ biến',
            'Hỗ trợ khách hàng 24/7',
            'Thông báo trạng thái sạc real-time'
        ],
        discountPercentage: 0,
        isActive: true
    },
    {
        packageName: 'Gói Trả Sau Tiêu Chuẩn',
        description: 'Gói dịch vụ trả sau tiêu chuẩn với nhiều ưu đãi. Phù hợp cho người dùng thường xuyên sử dụng dịch vụ sạc.',
        packageType: 'POSTPAID',
        price: 599000,
        durationDays: 30,
        features: [
            'Tất cả tính năng của Gói Trả Trước',
            'Giảm giá 10% cho mỗi lần sạc',
            'Ưu tiên cao hơn khi đặt chỗ',
            'Đặt trước tối đa 3 chỗ cùng lúc',
            'Truy cập vào các trạm VIP',
            'Báo cáo sử dụng chi tiết'
        ],
        discountPercentage: 10,
        isActive: true
    },
    {
        packageName: 'Gói VIP Cao Cấp',
        description: 'Gói dịch vụ VIP cao cấp nhất với đầy đủ tính năng và ưu đãi tối đa. Dành cho doanh nghiệp và người dùng VIP.',
        packageType: 'VIP',
        price: 999000,
        durationDays: 30,
        features: [
            'Tất cả tính năng của Gói Trả Sau',
            'Giảm giá 20% cho mỗi lần sạc',
            'Ưu tiên tuyệt đối khi đặt chỗ',
            'Đặt trước không giới hạn số chỗ',
            'Truy cập độc quyền các trạm Premium',
            'Hỗ trợ ưu tiên 24/7',
            'Quản lý nhiều phương tiện',
            'Báo cáo và phân tích nâng cao',
            'Dịch vụ bảo trì định kỳ'
        ],
        discountPercentage: 20,
        isActive: true
    },
    // Các gói theo entity hiện tại (SILVER, GOLD, PLATINUM)
    {
        packageName: 'Gói Bạc',
        description: 'Gói dịch vụ cơ bản dành cho người dùng mới. Phù hợp với nhu cầu sạc điện xe thông thường.',
        packageType: 'SILVER',
        price: 299000,
        durationDays: 30,
        features: [
            'Sạc không giới hạn tại tất cả các trạm',
            'Ưu tiên đặt chỗ tại trạm phổ biến',
            'Hỗ trợ khách hàng 24/7',
            'Thông báo trạng thái sạc real-time'
        ],
        discountPercentage: 0,
        isActive: true
    },
    {
        packageName: 'Gói Vàng',
        description: 'Gói dịch vụ nâng cao với nhiều ưu đãi. Phù hợp cho người dùng thường xuyên sử dụng dịch vụ sạc.',
        packageType: 'GOLD',
        price: 599000,
        durationDays: 30,
        features: [
            'Tất cả tính năng của Gói Bạc',
            'Giảm giá 10% cho mỗi lần sạc',
            'Ưu tiên cao hơn khi đặt chỗ',
            'Đặt trước tối đa 3 chỗ cùng lúc',
            'Truy cập vào các trạm VIP',
            'Báo cáo sử dụng chi tiết'
        ],
        discountPercentage: 10,
        isActive: true
    },
    {
        packageName: 'Gói Bạch Kim',
        description: 'Gói dịch vụ cao cấp nhất với đầy đủ tính năng và ưu đãi tối đa. Dành cho doanh nghiệp và người dùng VIP.',
        packageType: 'PLATINUM',
        price: 999000,
        durationDays: 30,
        features: [
            'Tất cả tính năng của Gói Vàng',
            'Giảm giá 20% cho mỗi lần sạc',
            'Ưu tiên tuyệt đối khi đặt chỗ',
            'Đặt trước không giới hạn số chỗ',
            'Truy cập độc quyền các trạm Premium',
            'Hỗ trợ ưu tiên 24/7',
            'Quản lý nhiều phương tiện',
            'Báo cáo và phân tích nâng cao',
            'Dịch vụ bảo trì định kỳ'
        ],
        discountPercentage: 20,
        isActive: true
    }
];

async function createPackage(packageData) {
    try {
        const response = await fetch(`${BASE_URL}/api/packages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(packageData)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        console.log(`✅ Created package: ${packageData.packageName} (${packageData.packageType})`);
        return data;
    } catch (error) {
        // Nếu package đã tồn tại, bỏ qua
        if (error.message.includes('already exists') || error.message.includes('409')) {
            console.log(`⚠️  Package ${packageData.packageName} already exists, skipping...`);
            return null;
        }
        console.error(`❌ Failed to create package ${packageData.packageName}:`, error.message);
        throw error;
    }
}

async function checkExistingPackages() {
    try {
        const response = await fetch(`${BASE_URL}/api/packages/getall`);
        if (response.ok) {
            const packages = await response.json();
            return Array.isArray(packages) ? packages : (packages.data || []);
        }
        return [];
    } catch (error) {
        console.warn('⚠️  Could not check existing packages:', error.message);
        return [];
    }
}

async function main() {
    console.log('🚀 Starting package seeding...\n');
    console.log(`📡 Base URL: ${BASE_URL}\n`);

    // Kiểm tra existing packages
    const existingPackages = await checkExistingPackages();
    console.log(`📊 Found ${existingPackages.length} existing package(s)\n`);

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const pkg of defaultPackages) {
        try {
            // Kiểm tra xem package đã tồn tại chưa
            const exists = existingPackages.some(
                existing => existing.packageType === pkg.packageType
            );

            if (exists) {
                console.log(`⏭️  Package ${pkg.packageName} (${pkg.packageType}) already exists, skipping...`);
                skipped++;
                continue;
            }

            await createPackage(pkg);
            created++;
            // Delay nhỏ để tránh rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            failed++;
            console.error(`❌ Error creating package ${pkg.packageName}:`, error.message);
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`\n✅ Package seeding completed!\n`);
}

// Chạy script
main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});

