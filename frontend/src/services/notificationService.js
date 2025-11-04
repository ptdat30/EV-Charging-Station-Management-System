// src/services/notificationService.js
import apiClient from '../config/api';

// Note: apiClient already has baseURL = 'http://localhost:8080/api'
// So we only need the endpoint path, not '/api/...'
const NOTIFICATION_API_BASE = '/notifications';
const FCM_TOKEN_API_BASE = '/fcm-tokens';

/**
 * Notification Service
 * Handles all notification-related API calls
 */
export const notificationService = {
  /**
   * Register FCM token with backend
   * @param {number} userId - User ID
   * @param {string} token - FCM token
   * @param {string} deviceType - Device type (e.g., 'web', 'android', 'ios')
   * @returns {Promise<Object>} Registered token data
   */
  registerFCMToken: async (userId, token, deviceType = 'web') => {
    try {
      console.log('📱 Registering FCM token for user:', userId);
      const response = await apiClient.post(
        `${FCM_TOKEN_API_BASE}/register?userId=${userId}`,
        {
          token,
          deviceType
        }
      );
      console.log('✅ FCM token registered successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error registering FCM token:', error);
      throw error;
    }
  },

  /**
   * Unregister FCM token from backend
   * @param {number} userId - User ID
   * @param {string} token - FCM token
   * @returns {Promise<void>}
   */
  unregisterFCMToken: async (userId, token) => {
    try {
      console.log('📱 Unregistering FCM token for user:', userId);
      await apiClient.delete(
        `${FCM_TOKEN_API_BASE}/unregister?userId=${userId}`,
        {
          data: { token }
        }
      );
      console.log('✅ FCM token unregistered successfully');
    } catch (error) {
      console.error('❌ Error unregistering FCM token:', error);
      throw error;
    }
  },

  /**
   * Get all notifications for a user
   * @param {number} userId - User ID
   * @param {Object} params - Query parameters (page, size, isRead, etc.)
   * @returns {Promise<Array>} List of notifications
   */
  getNotifications: async (userId, params = {}) => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        userId: userId.toString(),
        ...Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = value.toString();
          }
          return acc;
        }, {})
      });

      const url = `${NOTIFICATION_API_BASE}?${queryParams.toString()}`;
      console.log('📡 Fetching notifications from:', url);
      
      const response = await apiClient.get(url);
      
      console.log('✅ Notifications API response status:', response.status);
      console.log('✅ Notifications API response data:', response.data);
      console.log('✅ Number of notifications received:', Array.isArray(response.data) ? response.data.length : 0);
      
      // Ensure we return an array
      const notifications = Array.isArray(response.data) ? response.data : [];
      
      // Log each notification for debugging
      if (notifications.length > 0) {
        console.log('📋 Notifications details:');
        notifications.forEach((notif, index) => {
          console.log(`  [${index + 1}] ID: ${notif.notificationId}, Title: ${notif.title}, Read: ${notif.isRead}`);
        });
      } else {
        console.log('ℹ️ No notifications found in response (this is normal if user has no notifications yet)');
      }
      
      return notifications;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error message:', error.message);
      
      // Return empty array instead of throwing to prevent UI breakage
      if (error.response?.status === 404) {
        console.log('ℹ️ No notifications endpoint found or user not found, returning empty array');
        return [];
      }
      
      throw error;
    }
  },

  /**
   * Get unread notifications count
   * @param {number} userId - User ID
   * @returns {Promise<number>} Unread count
   */
  getUnreadCount: async (userId) => {
    try {
      const response = await apiClient.get(
        `${NOTIFICATION_API_BASE}/unread-count?userId=${userId}`
      );
      return response.data?.count || 0;
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      // Return 0 if endpoint doesn't exist yet
      return 0;
    }
  },

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.patch(
        `${NOTIFICATION_API_BASE}/${notificationId}/read`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read for a user
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  markAllAsRead: async (userId) => {
    try {
      await apiClient.patch(
        `${NOTIFICATION_API_BASE}/mark-all-read?userId=${userId}`
      );
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   * @param {number} notificationId - Notification ID
   * @returns {Promise<void>}
   */
  deleteNotification: async (notificationId) => {
    try {
      await apiClient.delete(`${NOTIFICATION_API_BASE}/${notificationId}`);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }
};

export default notificationService;

