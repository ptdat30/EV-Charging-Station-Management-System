// src/context/NotificationContext.jsx
import { createContext } from 'react';

export const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  fcmToken: null,
  isPermissionGranted: false,
  
  // Actions
  requestPermission: async () => {},
  registerToken: async () => {},
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  refreshNotifications: async () => {}
});

