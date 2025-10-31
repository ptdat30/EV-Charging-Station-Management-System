// src/services/chargingService.js
import apiClient from '../config/api';

/**
 * Lấy active session của user hiện tại
 */
export const getActiveSession = async () => {
    const response = await apiClient.get('/sessions/active');
    return response.data;
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
 */
export const getSessionStatus = async (sessionId) => {
    const response = await apiClient.get(`/sessions/${sessionId}/status`);
    return response.data;
};

/**
 * Kết thúc phiên sạc
 */
export const stopSession = async (sessionId) => {
    const response = await apiClient.post(`/sessions/${sessionId}/stop`);
    return response.data;
};

/**
 * Hủy phiên sạc
 */
export const cancelSession = async (sessionId) => {
    const response = await apiClient.post(`/sessions/${sessionId}/cancel`);
    return response.data;
};

