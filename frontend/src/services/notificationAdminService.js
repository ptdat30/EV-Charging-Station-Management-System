// src/services/notificationAdminService.js
import apiClient from '../config/api';

/**
 * Service for admin to send system notifications
 */

/**
 * Send maintenance notification to a user
 */
export const sendMaintenanceNotification = async (data) => {
  try {
    console.log('📤 Sending maintenance notification:', data);
    const response = await apiClient.post('/notifications/system/maintenance', data);
    console.log('✅ Maintenance notification sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending maintenance notification:', error);
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Notification Service đang chạy\n2. Service đã đăng ký vào Eureka\n3. API Gateway đang chạy');
    }
    if (!error.response) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo các service đang chạy.');
    }
    throw error;
  }
};

/**
 * Send promotion notification to a user
 */
export const sendPromotionNotification = async (data) => {
  try {
    console.log('📤 Sending promotion notification:', data);
    const response = await apiClient.post('/notifications/system/promotion', data);
    console.log('✅ Promotion notification sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending promotion notification:', error);
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Notification Service đang chạy\n2. Service đã đăng ký vào Eureka\n3. API Gateway đang chạy');
    }
    if (!error.response) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo các service đang chạy.');
    }
    throw error;
  }
};

/**
 * Send station offline notification
 */
export const sendStationOfflineNotification = async (data) => {
  try {
    console.log('📤 Sending station offline notification:', data);
    const response = await apiClient.post('/notifications/system/station-offline', data);
    console.log('✅ Station offline notification sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending station offline notification:', error);
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Notification Service đang chạy\n2. Service đã đăng ký vào Eureka\n3. API Gateway đang chạy');
    }
    if (!error.response) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo các service đang chạy.');
    }
    throw error;
  }
};

/**
 * Broadcast notification to multiple users
 */
export const broadcastNotification = async (data) => {
  try {
    console.log('📤 Broadcasting notification:', data);
    const response = await apiClient.post('/notifications/system/broadcast', data);
    console.log('✅ Broadcast notification sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error broadcasting notification:', error);
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Notification Service đang chạy\n2. Service đã đăng ký vào Eureka\n3. API Gateway đang chạy');
    }
    if (!error.response) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo các service đang chạy.');
    }
    throw error;
  }
};

/**
 * Get all users (for selecting recipients)
 */
export const getAllUsersForNotification = async () => {
  try {
    const response = await apiClient.get('/users/getall');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

/**
 * Get all stations (for selecting station)
 */
export const getAllStationsForNotification = async () => {
  try {
    const response = await apiClient.get('/stations/getall');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching stations:', error);
    return [];
  }
};

