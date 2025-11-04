// src/pages/DriverApp/Notifications/NotificationsPage.jsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../context/useNotification';
import './NotificationsPage.css';

const NotificationsPage = () => {
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

  const [filter, setFilter] = useState('all'); // all, unread, read
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest

  // Filter and sort notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Filter by read status
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [notifications, filter, sortBy]);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.notificationId);
    }

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
        return 'error';
      case 'wallet_low_balance':
      case 'system_maintenance':
      case 'station_offline':
        return 'warning';
      default:
        return 'info';
    }
  };

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
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      charging_started: 'Bắt đầu sạc',
      charging_complete: 'Sạc hoàn thành',
      charging_failed: 'Sạc thất bại',
      payment_success: 'Thanh toán thành công',
      payment_failed: 'Thanh toán thất bại',
      reservation_confirmed: 'Xác nhận đặt chỗ',
      reservation_reminder: 'Nhắc nhở đặt chỗ',
      reservation_cancelled: 'Hủy đặt chỗ',
      wallet_low_balance: 'Số dư thấp',
      promotion: 'Khuyến mãi',
      system_maintenance: 'Bảo trì hệ thống',
      station_offline: 'Trạm offline',
      review_request: 'Yêu cầu đánh giá',
      account_update: 'Cập nhật tài khoản'
    };
    return labels[type] || type;
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="header-top">
          <h1>
            <i className="fas fa-bell"></i>
            Thông báo
          </h1>
          {unreadCount > 0 && (
            <button
              className="btn-mark-all-read"
              onClick={handleMarkAllRead}
              type="button"
            >
              <i className="fas fa-check-double"></i>
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Tổng số:</span>
            <span className="stat-value">{notifications.length}</span>
          </div>
          <div className="stat-item unread">
            <span className="stat-label">Chưa đọc:</span>
            <span className="stat-value">{unreadCount}</span>
          </div>
        </div>

        <div className="header-filters">
          <div className="filter-group">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              type="button"
            >
              Tất cả ({notifications.length})
            </button>
            <button
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
              type="button"
            >
              Chưa đọc ({unreadCount})
            </button>
            <button
              className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
              onClick={() => setFilter('read')}
              type="button"
            >
              Đã đọc ({notifications.length - unreadCount})
            </button>
          </div>

          <div className="sort-group">
            <label>Sắp xếp:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
      </div>

      <div className="notifications-content">
        {isLoading ? (
          <div className="notifications-loading">
            <div className="spinner"></div>
            <p>Đang tải thông báo...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="empty-icon">
              <i className="fas fa-bell-slash"></i>
            </div>
            <h3>
              {filter === 'unread'
                ? 'Không có thông báo chưa đọc'
                : filter === 'read'
                ? 'Không có thông báo đã đọc'
                : 'Chưa có thông báo nào'}
            </h3>
            <p>
              {filter === 'unread'
                ? 'Tất cả thông báo đã được đọc'
                : 'Thông báo mới sẽ xuất hiện ở đây'}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.notificationId}
                className={`notification-card ${
                  !notification.isRead ? 'unread' : ''
                } ${getNotificationColor(notification.notificationType)}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon-wrapper">
                  <div className="notification-icon">
                    {getNotificationIcon(notification.notificationType)}
                  </div>
                  {!notification.isRead && (
                    <span className="unread-dot"></span>
                  )}
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">
                      {notification.title}
                    </h3>
                    <span className="notification-type">
                      {getTypeLabel(notification.notificationType)}
                    </span>
                  </div>
                  <p className="notification-message">
                    {notification.message}
                  </p>
                  <div className="notification-footer">
                    <span className="notification-time">
                      {formatTime(notification.createdAt)}
                    </span>
                    {notification.referenceId && (
                      <span className="notification-reference">
                        ID: {notification.referenceId}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="notification-delete-btn"
                  onClick={(e) => handleDelete(e, notification.notificationId)}
                  aria-label="Xóa thông báo"
                  type="button"
                  title="Xóa thông báo"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
