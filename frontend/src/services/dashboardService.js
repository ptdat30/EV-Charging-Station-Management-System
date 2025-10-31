// src/services/dashboardService.js
import apiClient from '../config/api';

/**
 * Lấy thống kê dashboard cho user
 */
export const getDashboardStats = async () => {
    const response = await apiClient.get('/sessions/dashboard/stats');
    return response.data;
};

/**
 * Lấy sessions gần đây
 */
export const getRecentSessions = async (limit = 5) => {
    const response = await apiClient.get('/sessions/recent', {
        params: { limit }
    });
    return response.data;
};

/**
 * Lấy energy usage chart data
 */
export const getEnergyUsageChart = async (period = 'week') => {
    const response = await apiClient.get('/sessions/energy-usage', {
        params: { period }
    });
    return response.data;
};

