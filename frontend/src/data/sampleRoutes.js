// Sample routes data - predefined routes for users to choose from
export const sampleRoutes = [
  // Fastest routes (Ưu tiên trạm sạc nhanh, ít dừng)
  {
    id: 'route-fast-1',
    name: 'Hà Nội - Hải Phòng Express',
    description: 'Lộ trình nhanh nhất từ Hà Nội đến Hải Phòng qua đường cao tốc',
    type: 'fastest',
    stations: [
      {
        stationId: 1,
        stationName: 'Trạm Sạc Nhanh Bắc Ninh',
        address: 'Km 20, Đường cao tốc Hà Nội - Hải Phòng, Bắc Ninh',
        order: 1,
        chargingDuration: 30, // minutes
        estimatedArrival: '+1h', // from start
        estimatedDeparture: '+1h30m'
      },
      {
        stationId: 2,
        stationName: 'Trạm Sạc Nhanh Hải Dương',
        address: 'Km 65, Đường cao tốc Hà Nội - Hải Phòng, Hải Dương',
        order: 2,
        chargingDuration: 25,
        estimatedArrival: '+2h',
        estimatedDeparture: '+2h25m'
      }
    ],
    totalDistance: 120, // km
    estimatedTime: 180, // minutes
    totalCost: 150000, // VND
    startLocation: 'Hà Nội',
    endLocation: 'Hải Phòng'
  },
  {
    id: 'route-fast-2',
    name: 'Sài Gòn - Đà Lạt Express',
    description: 'Lộ trình tốc hành từ Sài Gòn lên Đà Lạt, 2 điểm dừng sạc',
    type: 'fastest',
    stations: [
      {
        stationId: 3,
        stationName: 'Trạm Sạc Nhanh Long Khánh',
        address: 'Km 45, Quốc lộ 20, Long Khánh, Đồng Nai',
        order: 1,
        chargingDuration: 35,
        estimatedArrival: '+1h30m',
        estimatedDeparture: '+2h5m'
      },
      {
        stationId: 4,
        stationName: 'Trạm Sạc Nhanh Đơn Dương',
        address: 'Km 180, Quốc lộ 20, Đơn Dương, Lâm Đồng',
        order: 2,
        chargingDuration: 30,
        estimatedArrival: '+4h',
        estimatedDeparture: '+4h30m'
      }
    ],
    totalDistance: 300,
    estimatedTime: 360,
    totalCost: 320000,
    startLocation: 'Sài Gòn',
    endLocation: 'Đà Lạt'
  },
  {
    id: 'route-fast-3',
    name: 'Hà Nội - Sài Gòn Express',
    description: 'Lộ trình xuyên Việt nhanh nhất, 3 điểm dừng sạc',
    type: 'fastest',
    stations: [
      {
        stationId: 5,
        stationName: 'Trạm Sạc Nhanh Ninh Bình',
        address: 'Km 100, QL1A, Ninh Bình',
        order: 1,
        chargingDuration: 40,
        estimatedArrival: '+2h',
        estimatedDeparture: '+2h40m'
      },
      {
        stationId: 6,
        stationName: 'Trạm Sạc Nhanh Quảng Ngãi',
        address: 'Km 980, QL1A, Quảng Ngãi',
        order: 2,
        chargingDuration: 40,
        estimatedArrival: '+14h',
        estimatedDeparture: '+14h40m'
      },
      {
        stationId: 7,
        stationName: 'Trạm Sạc Nhanh Phan Thiết',
        address: 'Km 1500, QL1A, Phan Thiết, Bình Thuận',
        order: 3,
        chargingDuration: 35,
        estimatedArrival: '+22h',
        estimatedDeparture: '+22h35m'
      }
    ],
    totalDistance: 1750,
    estimatedTime: 1500,
    totalCost: 1800000,
    startLocation: 'Hà Nội',
    endLocation: 'Sài Gòn'
  },

  // Cheapest routes (Ưu tiên giá rẻ)
  {
    id: 'route-cheap-1',
    name: 'Hà Nội - Hải Phòng Tiết Kiệm',
    description: 'Lộ trình tiết kiệm nhất, qua các trạm sạc giá rẻ',
    type: 'cheapest',
    stations: [
      {
        stationId: 8,
        stationName: 'Trạm Sạc Gia Đình Bắc Ninh',
        address: 'Số 125 Đường Nguyễn Trãi, Bắc Ninh',
        order: 1,
        chargingDuration: 45,
        estimatedArrival: '+1h15m',
        estimatedDeparture: '+2h'
      },
      {
        stationId: 9,
        stationName: 'Trạm Sạc Tiết Kiệm Hải Dương',
        address: 'Số 45 Đường Trần Hưng Đạo, Hải Dương',
        order: 2,
        chargingDuration: 40,
        estimatedArrival: '+2h30m',
        estimatedDeparture: '+3h10m'
      }
    ],
    totalDistance: 120,
    estimatedTime: 210,
    totalCost: 90000,
    startLocation: 'Hà Nội',
    endLocation: 'Hải Phòng'
  },
  {
    id: 'route-cheap-2',
    name: 'Sài Gòn - Đà Lạt Tiết Kiệm',
    description: 'Lộ trình giá rẻ, tận dụng gói thuê bao',
    type: 'cheapest',
    stations: [
      {
        stationId: 10,
        stationName: 'Trạm Sạc Giá Rẻ Đồng Nai',
        address: 'Km 40, QL20, Đồng Nai',
        order: 1,
        chargingDuration: 50,
        estimatedArrival: '+1h45m',
        estimatedDeparture: '+2h35m'
      },
      {
        stationId: 11,
        stationName: 'Trạm Sạc Tiết Kiệm Bảo Lộc',
        address: 'Km 150, QL20, Bảo Lộc, Lâm Đồng',
        order: 2,
        chargingDuration: 45,
        estimatedArrival: '+4h30m',
        estimatedDeparture: '+5h15m'
      }
    ],
    totalDistance: 300,
    estimatedTime: 390,
    totalCost: 180000,
    startLocation: 'Sài Gòn',
    endLocation: 'Đà Lạt'
  },
  {
    id: 'route-cheap-3',
    name: 'Hà Nội - Sài Gòn Tiết Kiệm',
    description: 'Lộ trình xuyên Việt với chi phí thấp nhất, 4 điểm dừng',
    type: 'cheapest',
    stations: [
      {
        stationId: 12,
        stationName: 'Trạm Sạc Gia Đình Thanh Hóa',
        address: 'Km 180, QL1A, Thanh Hóa',
        order: 1,
        chargingDuration: 50,
        estimatedArrival: '+3h',
        estimatedDeparture: '+3h50m'
      },
      {
        stationId: 13,
        stationName: 'Trạm Sạc Tiết Kiệm Quảng Nam',
        address: 'Km 900, QL1A, Quảng Nam',
        order: 2,
        chargingDuration: 50,
        estimatedArrival: '+15h',
        estimatedDeparture: '+15h50m'
      },
      {
        stationId: 14,
        stationName: 'Trạm Sạc Giá Rẻ Phú Yên',
        address: 'Km 1100, QL1A, Phú Yên',
        order: 3,
        chargingDuration: 45,
        estimatedArrival: '+20h',
        estimatedDeparture: '+20h45m'
      },
      {
        stationId: 15,
        stationName: 'Trạm Sạc Tiết Kiệm Bình Thuận',
        address: 'Km 1480, QL1A, Bình Thuận',
        order: 4,
        chargingDuration: 40,
        estimatedArrival: '+24h30m',
        estimatedDeparture: '+25h10m'
      }
    ],
    totalDistance: 1750,
    estimatedTime: 1650,
    totalCost: 1200000,
    startLocation: 'Hà Nội',
    endLocation: 'Sài Gòn'
  },

  // Comfort routes (Ưu tiên trạm tại trung tâm mua sắm, có tiện ích)
  {
    id: 'route-comfort-1',
    name: 'Hà Nội - Hải Phòng Thoải Mái',
    description: 'Lộ trình qua các trung tâm thương mại, có khu vui chơi giải trí',
    type: 'comfort',
    stations: [
      {
        stationId: 16,
        stationName: 'Trạm Sạc AEON Mall Bắc Ninh',
        address: 'AEON Mall Bắc Ninh, Đường Nguyễn Văn Cừ, Bắc Ninh',
        order: 1,
        chargingDuration: 60,
        estimatedArrival: '+1h10m',
        estimatedDeparture: '+2h10m',
        amenities: ['Trung tâm thương mại', 'Nhà hàng', 'Rạp chiếu phim']
      },
      {
        stationId: 17,
        stationName: 'Trạm Sạc Vincom Hải Dương',
        address: 'Vincom Plaza Hải Dương, Đường Nguyễn Lương Bằng',
        order: 2,
        chargingDuration: 55,
        estimatedArrival: '+2h30m',
        estimatedDeparture: '+3h25m',
        amenities: ['Trung tâm thương mại', 'Quán cà phê', 'Khu vui chơi trẻ em']
      }
    ],
    totalDistance: 120,
    estimatedTime: 255,
    totalCost: 180000,
    startLocation: 'Hà Nội',
    endLocation: 'Hải Phòng'
  },
  {
    id: 'route-comfort-2',
    name: 'Sài Gòn - Đà Lạt Thoải Mái',
    description: 'Lộ trình thư giãn với điểm dừng tại khu du lịch và trung tâm mua sắm',
    type: 'comfort',
    stations: [
      {
        stationId: 18,
        stationName: 'Trạm Sạc Lotte Mart Đồng Nai',
        address: 'Lotte Mart Đồng Nai, Đường Nguyễn Ái Quốc, Biên Hòa',
        order: 1,
        chargingDuration: 70,
        estimatedArrival: '+1h30m',
        estimatedDeparture: '+2h40m',
        amenities: ['Siêu thị', 'Nhà hàng', 'Quán cà phê', 'Khu vui chơi']
      },
      {
        stationId: 19,
        stationName: 'Trạm Sạc Trung Tâm Thương Mại Đà Lạt',
        address: 'Trung tâm Thương mại Đà Lạt, Đường Trần Phú, Đà Lạt',
        order: 2,
        chargingDuration: 80,
        estimatedArrival: '+4h30m',
        estimatedDeparture: '+5h50m',
        amenities: ['Trung tâm thương mại', 'Nhà hàng đặc sản', 'Quán cà phê view đẹp', 'Khu mua sắm']
      }
    ],
    totalDistance: 300,
    estimatedTime: 420,
    totalCost: 280000,
    startLocation: 'Sài Gòn',
    endLocation: 'Đà Lạt'
  },
  {
    id: 'route-comfort-3',
    name: 'Hà Nội - Sài Gòn Thoải Mái',
    description: 'Hành trình xuyên Việt thư giãn, dừng tại các trung tâm thương mại lớn',
    type: 'comfort',
    stations: [
      {
        stationId: 20,
        stationName: 'Trạm Sạc BigC Ninh Bình',
        address: 'BigC Ninh Bình, Đường Trần Hưng Đạo, Ninh Bình',
        order: 1,
        chargingDuration: 70,
        estimatedArrival: '+2h',
        estimatedDeparture: '+3h10m',
        amenities: ['Siêu thị', 'Nhà hàng', 'Quán cà phê']
      },
      {
        stationId: 21,
        stationName: 'Trạm Sạc Vincom Đà Nẵng',
        address: 'Vincom Plaza Đà Nẵng, Đường Nguyễn Văn Linh, Đà Nẵng',
        order: 2,
        chargingDuration: 80,
        estimatedArrival: '+14h30m',
        estimatedDeparture: '+15h50m',
        amenities: ['Trung tâm thương mại', 'Rạp chiếu phim', 'Nhà hàng', 'Khu vui chơi']
      },
      {
        stationId: 22,
        stationName: 'Trạm Sạc Coopmart Nha Trang',
        address: 'Coopmart Nha Trang, Đường Trần Phú, Nha Trang',
        order: 3,
        chargingDuration: 75,
        estimatedArrival: '+21h',
        estimatedDeparture: '+22h15m',
        amenities: ['Siêu thị', 'Nhà hàng hải sản', 'Quán cà phê biển']
      }
    ],
    totalDistance: 1750,
    estimatedTime: 1650,
    totalCost: 2100000,
    startLocation: 'Hà Nội',
    endLocation: 'Sài Gòn'
  }
];

// Helper function to get routes by type
export const getRoutesByType = (type) => {
  return sampleRoutes.filter(route => route.type === type);
};

// Helper function to get route by ID
export const getRouteById = (id) => {
  return sampleRoutes.find(route => route.id === id);
};
