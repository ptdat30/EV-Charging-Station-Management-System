// src/services/paymentService.js
import apiClient from '../config/api';

/**
 * Lấy lịch sử thanh toán của người dùng
 */
export const getMyPayments = async (page = 0, size = 20) => {
    try {
        // Thử endpoint /payments/my-transactions trước
        const response = await apiClient.get('/payments/my-transactions', {
            params: { page, size }
        });
        return response.data;
    } catch (err) {
        // Nếu không có, có thể backend chưa có endpoint này
        console.warn('Payment history endpoint not found, returning empty array');
        return { content: [], totalElements: 0 };
    }
};

/**
 * Lấy thông tin payment theo ID
 */
export const getPaymentById = async (paymentId) => {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return response.data;
};

