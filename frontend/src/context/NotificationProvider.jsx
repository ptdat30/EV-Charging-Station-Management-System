// src/context/NotificationProvider.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationContext } from './NotificationContext';
import { requestNotificationPermission, getFCMToken, getMessagingInstance } from '../config/firebase';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  
  const messageListenerRef = useRef(null);

  // Check notification permission status
  useEffect(() => {
    if ('Notification' in window) {
      setIsPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  // Initialize FCM when user is authenticated
  useEffect(() => {
    const userId = user?.userId || user?.id;
    
    if (isAuthenticated && userId) {
      console.log('🔔 Initializing FCM for user:', userId);
      initializeFCM();
    } else {
      // Cleanup when user logs out
      if (fcmToken && userId) {
        cleanupFCM();
      }
      setFcmToken(null);
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      // Cleanup on unmount
      if (messageListenerRef.current) {
        messageListenerRef.current = null;
      }
    };
  }, [isAuthenticated, user?.userId, user?.id]);

  // Setup foreground message listener
  useEffect(() => {
    if (isAuthenticated && isPermissionGranted) {
      setupForegroundListener();
    }

    return () => {
      if (messageListenerRef.current) {
        messageListenerRef.current = null;
      }
    };
  }, [isAuthenticated, isPermissionGranted]);

  /**
   * Fetch notifications from backend
   */
  const fetchNotifications = useCallback(async () => {
    // Debug: Log user object to see structure
    console.log('🔔 Fetching notifications for user:', user);
    console.log('🔔 User object keys:', user ? Object.keys(user) : 'No user');
    console.log('🔔 User ID:', user?.id, 'User ID alternative:', user?.userId);
    
    // Try user.userId first (from auth), then user.id
    const userId = user?.userId || user?.id;
    
    if (!userId) {
      console.warn('⚠️ No user ID found, cannot fetch notifications');
      console.warn('⚠️ Full user object:', JSON.stringify(user, null, 2));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📡 Fetching notifications for userId:', userId);
      const data = await notificationService.getNotifications(userId);
      
      console.log('✅ Notifications fetched from service:', data);
      console.log('✅ Type of data:', typeof data);
      console.log('✅ Is array:', Array.isArray(data));
      console.log('✅ Number of notifications:', Array.isArray(data) ? data.length : 0);
      
      // Ensure data is an array
      const notificationsArray = Array.isArray(data) ? data : [];
      setNotifications(notificationsArray);
      
      // Calculate unread count
      const unread = notificationsArray.filter(n => !n.isRead || n.isRead === false).length;
      setUnreadCount(unread);
      console.log('📊 Total notifications:', notificationsArray.length);
      console.log('📊 Unread count:', unread);
      console.log('📊 Read count:', notificationsArray.length - unread);
      
      // Log sample notification structure if available
      if (notificationsArray.length > 0) {
        console.log('📋 Sample notification structure:', {
          notificationId: notificationsArray[0].notificationId,
          userId: notificationsArray[0].userId,
          title: notificationsArray[0].title,
          message: notificationsArray[0].message,
          notificationType: notificationsArray[0].notificationType,
          isRead: notificationsArray[0].isRead,
          createdAt: notificationsArray[0].createdAt
        });
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      setError(error.message);
      // Set empty array on error to prevent UI issues
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [user?.userId, user?.id]);

  // Fetch notifications when user is authenticated
  useEffect(() => {
    const userId = user?.userId || user?.id;
    
    if (isAuthenticated && userId) {
      console.log('📬 Setting up notification polling for user:', userId);
      fetchNotifications();
      // Set up polling to refresh notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.userId, user?.id, fetchNotifications]);

  /**
   * Initialize Firebase Cloud Messaging
   */
  const initializeFCM = async () => {
    try {
      console.log('🔔 Initializing FCM...');
      
      // Request notification permission
      const token = await requestNotificationPermission();
      
      if (token) {
        setFcmToken(token);
        setIsPermissionGranted(true);
        
        // Register token with backend
        await registerToken(token);
        console.log('✅ FCM initialized successfully');
      } else {
        console.log('ℹ️ FCM not available - app will work with polling notifications only');
        setIsPermissionGranted(false);
      }
    } catch (error) {
      // Gracefully handle FCM initialization errors
      console.warn('⚠️ FCM initialization skipped:', error.message || error);
      console.log('ℹ️ App will continue with polling-based notifications');
      // Don't set error state - app works fine without FCM
      setIsPermissionGranted(false);
    }
  };

  /**
   * Register FCM token with backend
   */
  const registerToken = async (token) => {
    const userId = user?.userId || user?.id;
    
    if (!userId || !token) {
      console.warn('⚠️ Cannot register FCM token: missing userId or token');
      return;
    }

    try {
      console.log('📱 Registering FCM token for user:', userId);
      await notificationService.registerFCMToken(userId, token, 'web');
      console.log('✅ FCM token registered with backend');
    } catch (error) {
      console.error('❌ Error registering FCM token:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      // Don't set error state here as it's not critical for user experience
    }
  };

  /**
   * Setup foreground message listener
   */
  const setupForegroundListener = async () => {
    try {
      const messagingInstance = await getMessagingInstance();
      if (!messagingInstance) {
        return;
      }

      // Import onMessage dynamically
      const { onMessage } = await import('firebase/messaging');
      
      // Set up continuous listener
      onMessage(messagingInstance, (payload) => {
        console.log('📨 Received foreground notification:', payload);
        
        // Convert Firebase message to notification format
        const notification = {
          notificationId: payload.data?.notificationId ? parseInt(payload.data.notificationId) : Date.now(),
          title: payload.notification?.title || payload.data?.title || 'New Notification',
          message: payload.notification?.body || payload.data?.message || '',
          notificationType: payload.data?.notificationType || 'system',
          referenceId: payload.data?.referenceId ? parseInt(payload.data.referenceId) : null,
          isRead: false,
          createdAt: new Date().toISOString()
        };

        // Add to notifications list
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Refresh notifications from backend
        fetchNotifications();

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          showBrowserNotification(notification);
        }
      });
      
      console.log('✅ Foreground message listener set up successfully');
    } catch (error) {
      console.error('❌ Error setting up message listener:', error);
    }
  };

  /**
   * Show browser notification
   */
  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/vite.svg', // You can customize this
        badge: '/vite.svg',
        tag: `notification-${notification.notificationId}`,
        data: notification
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        // You can navigate to a specific page here
      };
    }
  };

  /**
   * Request notification permission
   */
  const requestPermission = async () => {
    try {
      const token = await requestNotificationPermission();
      if (token) {
        setFcmToken(token);
        setIsPermissionGranted(true);
        await registerToken(token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      setError(error.message);
      return false;
    }
  };

  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );
      
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      // Still update local state optimistically
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    const userId = user?.userId || user?.id;
    
    if (!userId) {
      return;
    }

    try {
      await notificationService.markAllAsRead(userId);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
      // Still update local state optimistically
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    }
  };

  /**
   * Delete notification
   */
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications((prev) =>
        prev.filter((n) => n.notificationId !== notificationId)
      );
      
      // Update unread count
      const deleted = notifications.find(n => n.notificationId === notificationId);
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      // Still update local state optimistically
      setNotifications((prev) =>
        prev.filter((n) => n.notificationId !== notificationId)
      );
    }
  };

  /**
   * Refresh notifications
   */
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  /**
   * Cleanup FCM on logout
   */
  const cleanupFCM = async () => {
    const userId = user?.userId || user?.id;
    
    if (fcmToken && userId) {
      try {
        await notificationService.unregisterFCMToken(userId, fcmToken);
        console.log('✅ FCM token unregistered');
      } catch (error) {
        console.error('❌ Error unregistering FCM token:', error);
      }
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fcmToken,
    isPermissionGranted,
    requestPermission,
    registerToken,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};



