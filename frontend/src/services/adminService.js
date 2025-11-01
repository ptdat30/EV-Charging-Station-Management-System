// src/services/adminService.js
import apiClient from '../config/api';

/**
 * Lấy thống kê tổng quan cho Admin Dashboard
 */
export const getAdminDashboardStats = async () => {
  try {
    // Fetch tất cả dữ liệu song song để tối ưu performance
    const [stations, users, sessions, transactions] = await Promise.all([
      apiClient.get('/stations/getall').catch(() => ({ data: [] })),
      apiClient.get('/users/getall').catch(() => ({ data: [] })),
      apiClient.get('/sessions').catch(() => ({ data: [] })),
      apiClient.get('/transactions/history').catch(() => ({ data: [] }))
    ]);

    const stationsList = Array.isArray(stations.data) ? stations.data : [];
    const usersList = Array.isArray(users.data) ? users.data : [];
    const sessionsList = Array.isArray(sessions.data) ? sessions.data : [];
    const transactionsList = Array.isArray(transactions.data) ? transactions.data : [];

    // Tính toán thống kê
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tổng số trạm và trạm đang hoạt động
    const totalStations = stationsList.length;
    const activeStations = stationsList.filter(s => 
      s.status === 'ACTIVE' || s.status === 'ONLINE' || !s.status
    ).length;

    // Tổng số người dùng
    const totalUsers = usersList.length;
    const individualUsers = usersList.filter(u => u.userType === 'DRIVER' || !u.userType).length;
    const businessUsers = usersList.filter(u => u.userType === 'BUSINESS').length;
    const staffUsers = usersList.filter(u => u.role === 'STAFF' || u.roles?.includes('STAFF')).length;

    // Tính doanh thu và năng lượng hôm nay
    const todaySessions = sessionsList.filter(s => {
      if (!s.startTime) return false;
      const sessionDate = new Date(s.startTime);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    const todayRevenue = todaySessions.reduce((sum, session) => {
      return sum + (session.totalAmount || session.amount || 0);
    }, 0);

    const todayEnergy = todaySessions.reduce((sum, session) => {
      return sum + (session.energyConsumed || 0);
    }, 0);

    // Tổng số phiên sạc
    const totalSessions = sessionsList.length;
    const activeSessions = sessionsList.filter(s => 
      s.sessionStatus === 'CHARGING' || s.sessionStatus === 'ACTIVE'
    ).length;

    // Tính doanh thu và năng lượng 7 ngày qua
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const weekSessions = sessionsList.filter(s => {
      if (!s.startTime) return false;
      const sessionDate = new Date(s.startTime);
      return sessionDate >= weekAgo;
    });

    // Nhóm theo ngày trong tuần
    const energyByDay = {};
    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dayKey = daysOfWeek[date.getDay()];
      
      energyByDay[dayKey] = weekSessions
        .filter(s => {
          if (!s.startTime) return false;
          const sessionDate = new Date(s.startTime);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === date.getTime();
        })
        .reduce((sum, session) => sum + (session.energyConsumed || 0), 0);
    }

    const energyData = daysOfWeek.map(day => ({
      day,
      kWh: energyByDay[day] || 0
    }));

    // Tính doanh thu 12 tháng qua
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 12);
    
    const monthlyRevenue = {};
    const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      const monthKey = monthNames[date.getMonth()];
      
      monthlyRevenue[monthKey] = sessionsList
        .filter(s => {
          if (!s.startTime) return false;
          const sessionDate = new Date(s.startTime);
          return sessionDate.getMonth() === date.getMonth() && 
                 sessionDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, session) => sum + ((session.totalAmount || session.amount || 0) / 1000000), 0);
    }

    const revenueData = monthNames.map(month => ({
      month,
      revenue: Math.round(monthlyRevenue[month] || 0)
    }));

    // Trạng thái trạm sạc
    const stationStatusCount = {
      active: stationsList.filter(s => s.status === 'ACTIVE' || s.status === 'ONLINE' || !s.status).length,
      charging: activeSessions,
      maintenance: stationsList.filter(s => s.status === 'MAINTENANCE' || s.status === 'OFFLINE').length,
      error: stationsList.filter(s => s.status === 'ERROR').length
    };

    const statusData = [
      { name: 'Hoạt động', value: stationStatusCount.active, color: '#10b981' },
      { name: 'Đang sạc', value: stationStatusCount.charging, color: '#3b82f6' },
      { name: 'Bảo trì', value: stationStatusCount.maintenance, color: '#f59e0b' },
      { name: 'Lỗi', value: stationStatusCount.error, color: '#ef4444' }
    ];

    return {
      stats: {
        totalStations,
        activeStations,
        totalUsers,
        individualUsers,
        businessUsers,
        staffUsers,
        todayRevenue,
        todayEnergy,
        totalSessions,
        activeSessions
      },
      charts: {
        energyData,
        revenueData,
        statusData
      }
    };
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    throw error;
  }
};

/**
 * Lấy danh sách hoạt động gần đây
 */
export const getRecentActivities = async (limit = 10) => {
  try {
    const [sessions, users] = await Promise.all([
      apiClient.get('/sessions').catch(() => ({ data: [] })),
      apiClient.get('/users/getall').catch(() => ({ data: [] }))
    ]);

    const sessionsList = Array.isArray(sessions.data) ? sessions.data : [];
    const usersList = Array.isArray(users.data) ? users.data : [];

    // Sắp xếp sessions theo thời gian mới nhất
    const recentSessions = sessionsList
      .sort((a, b) => new Date(b.startTime || b.createdAt) - new Date(a.startTime || a.createdAt))
      .slice(0, limit);

    const activities = recentSessions.map(session => {
      const user = usersList.find(u => u.id === session.userId);
      const timeAgo = getTimeAgo(new Date(session.startTime || session.createdAt));

      return {
        id: session.sessionId || session.id,
        type: 'session',
        message: `Người dùng ${user?.fullName || user?.email || `#${session.userId}`} bắt đầu phiên sạc tại Trạm #${session.stationId}`,
        time: timeAgo,
        icon: 'fa-bolt',
        session
      };
    });

    return activities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};

/**
 * Helper function để tính thời gian trước đó
 */
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
}

