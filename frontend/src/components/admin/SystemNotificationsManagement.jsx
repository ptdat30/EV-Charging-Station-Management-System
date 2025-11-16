// src/components/admin/SystemNotificationsManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  broadcastNotification,
  getAllUsersForNotification
} from '../../services/notificationAdminService';
import './SystemNotificationsManagement.css';

const SystemNotificationsManagement = () => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Users data
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const [broadcastForm, setBroadcastForm] = useState({
    userIds: [],
    notificationType: 'system_maintenance',
    title: '',
    message: ''
  });

  // Load users and stations on mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const usersData = await getAllUsersForNotification();
        
        // Deduplicate users by userId to prevent duplicate keys
        const uniqueUsers = Array.from(
          new Map((usersData || []).map(user => [user.userId || user.id, user])).values()
        );
        
        console.log(`✅ Loaded ${usersData?.length || 0} users, ${uniqueUsers.length} unique`);
        setUsers(uniqueUsers);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      if (broadcastForm.userIds.length === 0) {
        setErrorMessage('Vui lòng chọn ít nhất một người dùng.');
        setLoading(false);
        return;
      }

      const data = {
        userIds: broadcastForm.userIds.map(id => parseInt(id)),
        notificationType: broadcastForm.notificationType,
        title: broadcastForm.title,
        message: broadcastForm.message
      };

      await broadcastNotification(data);
      setSuccessMessage(`✅ Đã gửi thông báo đến ${broadcastForm.userIds.length} người dùng!`);
      setBroadcastForm({
        userIds: [],
        notificationType: 'system_maintenance',
        title: '',
        message: ''
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Không thể gửi thông báo. Vui lòng thử lại.';
      setErrorMessage(errorMsg.split('\n').map((line, i) => i === 0 ? line : `  • ${line}`).join('\n'));
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelectChange = (userId, checked) => {
    if (checked) {
      setBroadcastForm(prev => ({
        ...prev,
        userIds: [...prev.userIds, userId]
      }));
    } else {
      setBroadcastForm(prev => ({
        ...prev,
        userIds: prev.userIds.filter(id => id !== userId)
      }));
    }
  };

  const handleSelectAllUsers = () => {
    if (broadcastForm.userIds.length === users.length) {
      setBroadcastForm(prev => ({ ...prev, userIds: [] }));
    } else {
      // Lưu tất cả ID dưới dạng string để đồng bộ với checkbox (checked/includes dùng String)
      setBroadcastForm(prev => ({ ...prev, userIds: users.map(u => String(u.id || u.userId)) }));
    }
  };

  if (loadingData) {
    return (
      <div className="system-notifications-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="system-notifications-management">
      <div className="page-header">
        <h1>📨 Quản Lý Thông Báo Hệ Thống</h1>
        <p className="page-description">
          Gửi thông báo đến người dùng với nhiều loại khác nhau (bảo trì hệ thống, khuyến mãi, trạm offline, cập nhật tài khoản)
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {errorMessage}
        </div>
      )}

      {/* Single Notification Form */}
        <div className="notification-form-container">
          <form onSubmit={handleBroadcastSubmit} className="notification-form">
            <div className="form-group">
              <label>
                Người Nhận <span className="required">*</span>
                <span className="selected-count">
                  ({broadcastForm.userIds.length} người dùng đã chọn)
                </span>
              </label>
              <div className="user-selector">
                <div className="user-selector-header">
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={handleSelectAllUsers}
                  >
                    {broadcastForm.userIds.length === users.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>
                <div className="user-list">
                  {users.map(user => (
                    <label key={user.id || user.userId} className="user-checkbox">
                      <input
                        type="checkbox"
                        checked={broadcastForm.userIds.includes(String(user.id || user.userId))}
                        onChange={(e) => handleUserSelectChange(String(user.id || user.userId), e.target.checked)}
                      />
                      <span className="user-info">
                        {user.fullName || user.email} ({user.email})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="broadcast-type">
                Loại Thông Báo <span className="required">*</span>
              </label>
              <select
                id="broadcast-type"
                value={broadcastForm.notificationType}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, notificationType: e.target.value })}
                required
                className="form-control"
              >
                <option value="system_maintenance">Bảo Trì Hệ Thống</option>
                <option value="promotion">Khuyến Mãi</option>
                <option value="station_offline">Trạm Offline</option>
                <option value="account_update">Cập Nhật Tài Khoản</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="broadcast-title">
                Tiêu Đề <span className="required">*</span>
              </label>
              <input
                type="text"
                id="broadcast-title"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                placeholder="Tiêu đề thông báo..."
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="broadcast-message">
                Nội Dung <span className="required">*</span>
              </label>
              <textarea
                id="broadcast-message"
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                placeholder="Nội dung thông báo..."
                rows="5"
                required
                className="form-control"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang gửi...' : `Gửi Đến ${broadcastForm.userIds.length} Người Dùng`}
            </button>
          </form>
        </div>
    </div>
  );
};

export default SystemNotificationsManagement;

