// src/services/chargingService.js
import apiClient from '../config/api';

/**
 * Lấy active session của user hiện tại
 * @returns {Promise<Object|null>} Session object nếu có, null nếu không có active session
 */
export const getActiveSession = async () => {
    try {
        const response = await apiClient.get('/sessions/active');
        // Nếu status 204 (no content), response.data có thể undefined
        if (response.status === 204 || !response.data) {
            return null;
        }
        return response.data;
    } catch (err) {
        // Nếu lỗi 204 (no content) từ axios interceptor
        if (err.response?.status === 204) {
            return null;
        }
        throw err;
    }
};

/**
 * Lấy thông tin session theo ID
 */
export const getSessionById = async (sessionId) => {
    const response = await apiClient.get(`/sessions/${sessionId}`);
    return response.data;
};

/**
 * Lấy trạng thái sạc real-time (SOC%, thời gian còn lại, chi phí)
 * @param {number} sessionId - ID của session
 * @param {number} speedMultiplier - Tốc độ tua nhanh (1, 2, 4, 8, 100) - default 1
 */
export const getSessionStatus = async (sessionId, speedMultiplier = 1) => {
    console.log(`🔍 API call: /sessions/${sessionId}/status?speedMultiplier=${speedMultiplier}`);
    const response = await apiClient.get(`/sessions/${sessionId}/status?speedMultiplier=${speedMultiplier}`);
    console.log('📥 Response SOC:', response.data?.currentSOC);
    return response.data;
};

/**
 * Kết thúc phiên sạc
 * @param {number} sessionId - ID của session
 * @param {object} stopData - {energyCharged, currentSOC} từ status hiện tại
 */
export const stopSession = async (sessionId, stopData = null) => {
    const response = await apiClient.post(`/sessions/${sessionId}/stop`, stopData);
    return response.data;
};

/**
 * Hủy phiên sạc
 */
export const cancelSession = async (sessionId) => {
    const response = await apiClient.post(`/sessions/${sessionId}/cancel`);
    return response.data;
};

