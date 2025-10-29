// Dữ liệu người dùng giả để kiểm tra đăng nhập
export const mockUsers = [
    {
        email: 'driver1@example.com',
        password: 'password123',
        name: 'Nguyễn Văn A',
        phone: '0901234567',
    },
    {
        email: 'driver2@example.com',
        password: 'password456',
        name: 'Trần Thị B',
        phone: '0907654321',
    },
];

// Dữ liệu các trạm sạc giả
export const mockStations = [
    {
        id: 1,
        name: 'Trạm sạc Vincom Center',
        address: '72 Lê Thánh Tôn, P. Bến Nghé, Quận 1, TP.HCM',
        status: 'available', // 'available', 'in_use', 'offline'
        ports: [
            { type: 'CCS2', power: '150kW', available: 2, total: 4 },
            { type: 'Type 2', power: '22kW', available: 5, total: 5 },
        ],
        coordinates: { lat: 10.7797, lng: 106.7023 },
    },
    //... thêm các trạm khác
];