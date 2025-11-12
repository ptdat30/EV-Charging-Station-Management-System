// src/components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../context/useNotification';
import './NotificationBell.css';

const NotificationBell = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  } = useNotification();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      refreshNotifications();
    }
  }, [isOpen, refreshNotifications]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.notificationId);
    }
    setIsOpen(false);
    
    // Navigate to specific page based on notification type
    switch (notification.notificationType) {
      case 'charging_started':
      case 'charging_complete':
      case 'charging_failed':
        navigate('/sessions/live');
        break;
      case 'payment_success':
      case 'payment_failed':
        navigate('/payment');
        break;
      case 'reservation_confirmed':
      case 'reservation_reminder':
      case 'reservation_cancelled':
        navigate('/stations/booking');
        break;
      case 'wallet_low_balance':
        navigate('/wallet');
        break;
      case 'incident_reported':
        // Navigate to incidents page for staff/admin
        navigate('/staff/incidents');
        break;
      default:
        // No navigation for other types
        break;
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'charging_started':
      case 'charging_complete':
      case 'charging_failed':
        return <i className="fas fa-charging-station"></i>;
      case 'payment_success':
      case 'payment_failed':
      case 'wallet_low_balance':
        return <i className="fas fa-wallet"></i>;
      case 'reservation_confirmed':
      case 'reservation_reminder':
      case 'reservation_cancelled':
        return <i className="fas fa-calendar-check"></i>;
      case 'incident_reported':
        return <i className="fas fa-exclamation-triangle"></i>;
      case 'promotion':
        return <i className="fas fa-gift"></i>;
      case 'system_maintenance':
      case 'station_offline':
        return <i className="fas fa-tools"></i>;
      default:
        return <i className="fas fa-bell"></i>;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'charging_started':
      case 'payment_success':
      case 'reservation_confirmed':
        return 'success';
      case 'charging_failed':
      case 'payment_failed':
      case 'incident_reported':
        return 'error';
      case 'wallet_low_balance':
      case 'system_maintenance':
      case 'station_offline':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        type="button"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Thông báo</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-button"
                onClick={handleMarkAllRead}
                type="button"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="notification-list">
            {isLoading ? (
              <div className="notification-loading">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">Không có thông báo</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`notification-item ${
                    !notification.isRead ? 'unread' : ''
                  } ${getNotificationColor(notification.notificationType)}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.notificationType)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                      {!notification.isRead && (
                        <span className="unread-indicator"></span>
                      )}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>
                  <button
                    className="notification-delete"
                    onClick={(e) => handleDelete(e, notification.notificationId)}
                    aria-label="Delete notification"
                    type="button"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <Link
                to="/notifications"
                className="view-all-notifications-link"
                onClick={() => setIsOpen(false)}
              >
                Xem tất cả thông báo
                <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Format time helper
const formatTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} giờ trước`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  } else {
    return date.toLocaleDateString('vi-VN');
  }
};

export default NotificationBell;

