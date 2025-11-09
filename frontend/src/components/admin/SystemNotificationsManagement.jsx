// src/components/admin/SystemNotificationsManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  sendMaintenanceNotification, 
  sendPromotionNotification, 
  sendStationOfflineNotification,
  broadcastNotification,
  getAllUsersForNotification,
  getAllStationsForNotification
} from '../../services/notificationAdminService';
import './SystemNotificationsManagement.css';

const SystemNotificationsManagement = () => {
  const [activeTab, setActiveTab] = useState('maintenance');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Users and Stations data
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form states
  const [maintenanceForm, setMaintenanceForm] = useState({
    userId: '',
    maintenanceDate: '',
    maintenanceTime: '',
    duration: '',
    description: ''
  });

  const [promotionForm, setPromotionForm] = useState({
    userId: '',
    title: '',
    message: '',
    promotionCode: ''
  });

  const [stationOfflineForm, setStationOfflineForm] = useState({
    userId: '',
    stationId: '',
    stationName: ''
  });

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
        const [usersData, stationsData] = await Promise.all([
          getAllUsersForNotification(),
          getAllStationsForNotification()
        ]);
        
        // Deduplicate users by userId to prevent duplicate keys
        const uniqueUsers = Array.from(
          new Map((usersData || []).map(user => [user.userId || user.id, user])).values()
        );
        
        console.log(`✅ Loaded ${usersData?.length || 0} users, ${uniqueUsers.length} unique`);
        setUsers(uniqueUsers);
        setStations(stationsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const maintenanceDateTime = maintenanceForm.maintenanceDate && maintenanceForm.maintenanceTime
        ? `${maintenanceForm.maintenanceDate} ${maintenanceForm.maintenanceTime}`
        : maintenanceForm.maintenanceDate;

      const data = {
        userId: parseInt(maintenanceForm.userId),
        maintenanceDate: maintenanceDateTime,
        duration: maintenanceForm.duration,
        description: maintenanceForm.description
      };

      await sendMaintenanceNotification(data);
      setSuccessMessage('✅ Thông báo bảo trì đã được gửi thành công!');
      setMaintenanceForm({
        userId: '',
        maintenanceDate: '',
        maintenanceTime: '',
        duration: '',
        description: ''
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Không thể gửi thông báo. Vui lòng thử lại.';
      setErrorMessage(errorMsg.split('\n').map((line, i) => i === 0 ? line : `  • ${line}`).join('\n'));
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const data = {
        userId: parseInt(promotionForm.userId),
        title: promotionForm.title || '🎁 Khuyến mãi mới!',
        message: promotionForm.message,
        promotionCode: promotionForm.promotionCode || null
      };

      await sendPromotionNotification(data);
      setSuccessMessage('✅ Thông báo khuyến mãi đã được gửi thành công!');
      setPromotionForm({
        userId: '',
        title: '',
        message: '',
        promotionCode: ''
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Không thể gửi thông báo. Vui lòng thử lại.';
      setErrorMessage(errorMsg.split('\n').map((line, i) => i === 0 ? line : `  • ${line}`).join('\n'));
    } finally {
      setLoading(false);
    }
  };

  const handleStationOfflineSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const selectedStation = stations.find(s => s.stationId === parseInt(stationOfflineForm.stationId));
      const data = {
        userId: parseInt(stationOfflineForm.userId),
        stationId: parseInt(stationOfflineForm.stationId),
        stationName: stationOfflineForm.stationName || selectedStation?.stationName || 'Không xác định'
      };

      await sendStationOfflineNotification(data);
      setSuccessMessage('✅ Thông báo trạm offline đã được gửi thành công!');
      setStationOfflineForm({
        userId: '',
        stationId: '',
        stationName: ''
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Không thể gửi thông báo. Vui lòng thử lại.';
      setErrorMessage(errorMsg.split('\n').map((line, i) => i === 0 ? line : `  • ${line}`).join('\n'));
    } finally {
      setLoading(false);
    }
  };

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
      setBroadcastForm(prev => ({ ...prev, userIds: users.map(u => u.id || u.userId) }));
    }
  };

  const handleStationChange = (stationId) => {
    const station = stations.find(s => s.stationId === parseInt(stationId));
    setStationOfflineForm(prev => ({
      ...prev,
      stationId,
      stationName: station?.stationName || ''
    }));
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
          Gửi thông báo đến người dùng: bảo trì hệ thống, khuyến mãi, trạm offline, hoặc broadcast
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

      {/* Tabs */}
      <div className="notification-tabs">
        <button
          className={`tab ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          <i className="fas fa-tools"></i> Bảo Trì Hệ Thống
        </button>
        <button
          className={`tab ${activeTab === 'promotion' ? 'active' : ''}`}
          onClick={() => setActiveTab('promotion')}
        >
          <i className="fas fa-gift"></i> Khuyến Mãi
        </button>
        <button
          className={`tab ${activeTab === 'station-offline' ? 'active' : ''}`}
          onClick={() => setActiveTab('station-offline')}
        >
          <i className="fas fa-exclamation-triangle"></i> Trạm Offline
        </button>
        <button
          className={`tab ${activeTab === 'broadcast' ? 'active' : ''}`}
          onClick={() => setActiveTab('broadcast')}
        >
          <i className="fas fa-bullhorn"></i> Broadcast
        </button>
      </div>

      {/* Maintenance Form */}
      {activeTab === 'maintenance' && (
        <div className="notification-form-container">
          <form onSubmit={handleMaintenanceSubmit} className="notification-form">
            <div className="form-group">
              <label htmlFor="maintenance-user">
                Người Dùng <span className="required">*</span>
              </label>
              <select
                id="maintenance-user"
                value={maintenanceForm.userId}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, userId: e.target.value })}
                required
                className="form-control"
              >
                <option value="">Chọn người dùng...</option>
                {users.map(user => (
                  <option key={user.id || user.userId} value={user.id || user.userId}>
                    {user.fullName || user.email} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="maintenance-date">
                  Ngày Bảo Trì <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="maintenance-date"
                  value={maintenanceForm.maintenanceDate}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenanceDate: e.target.value })}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="maintenance-time">Giờ Bảo Trì</label>
                <input
                  type="time"
                  id="maintenance-time"
                  value={maintenanceForm.maintenanceTime}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenanceTime: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="maintenance-duration">
                Thời Lượng <span className="required">*</span>
              </label>
              <input
                type="text"
                id="maintenance-duration"
                value={maintenanceForm.duration}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, duration: e.target.value })}
                placeholder="VD: 2 giờ, 30 phút, 1 ngày"
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="maintenance-description">Mô Tả</label>
              <textarea
                id="maintenance-description"
                value={maintenanceForm.description}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                placeholder="Mô tả chi tiết về việc bảo trì..."
                rows="4"
                className="form-control"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi Thông Báo Bảo Trì'}
            </button>
          </form>
        </div>
      )}

      {/* Promotion Form */}
      {activeTab === 'promotion' && (
        <div className="notification-form-container">
          <form onSubmit={handlePromotionSubmit} className="notification-form">
            <div className="form-group">
              <label htmlFor="promotion-user">
                Người Dùng <span className="required">*</span>
              </label>
              <select
                id="promotion-user"
                value={promotionForm.userId}
                onChange={(e) => setPromotionForm({ ...promotionForm, userId: e.target.value })}
                required
                className="form-control"
              >
                <option value="">Chọn người dùng...</option>
                {users.map(user => (
                  <option key={user.id || user.userId} value={user.id || user.userId}>
                    {user.fullName || user.email} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="promotion-title">Tiêu Đề</label>
              <input
                type="text"
                id="promotion-title"
                value={promotionForm.title}
                onChange={(e) => setPromotionForm({ ...promotionForm, title: e.target.value })}
                placeholder="VD: 🎁 Khuyến mãi 50% phí sạc"
                className="form-control"
              />
              <small className="form-hint">Để trống sẽ dùng tiêu đề mặc định</small>
            </div>

            <div className="form-group">
              <label htmlFor="promotion-message">
                Nội Dung <span className="required">*</span>
              </label>
              <textarea
                id="promotion-message"
                value={promotionForm.message}
                onChange={(e) => setPromotionForm({ ...promotionForm, message: e.target.value })}
                placeholder="Nội dung khuyến mãi..."
                rows="4"
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="promotion-code">Mã Khuyến Mãi</label>
              <input
                type="text"
                id="promotion-code"
                value={promotionForm.promotionCode}
                onChange={(e) => setPromotionForm({ ...promotionForm, promotionCode: e.target.value })}
                placeholder="VD: PROMO50"
                className="form-control"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi Thông Báo Khuyến Mãi'}
            </button>
          </form>
        </div>
      )}

      {/* Station Offline Form */}
      {activeTab === 'station-offline' && (
        <div className="notification-form-container">
          <form onSubmit={handleStationOfflineSubmit} className="notification-form">
            <div className="form-group">
              <label htmlFor="station-offline-user">
                Người Dùng <span className="required">*</span>
              </label>
              <select
                id="station-offline-user"
                value={stationOfflineForm.userId}
                onChange={(e) => setStationOfflineForm({ ...stationOfflineForm, userId: e.target.value })}
                required
                className="form-control"
              >
                <option value="">Chọn người dùng...</option>
                {users.map(user => (
                  <option key={user.id || user.userId} value={user.id || user.userId}>
                    {user.fullName || user.email} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="station-offline-station">
                Trạm Sạc <span className="required">*</span>
              </label>
              <select
                id="station-offline-station"
                value={stationOfflineForm.stationId}
                onChange={(e) => handleStationChange(e.target.value)}
                required
                className="form-control"
              >
                <option value="">Chọn trạm sạc...</option>
                {stations.map(station => (
                  <option key={station.stationId} value={station.stationId}>
                    {station.stationName} (ID: {station.stationId})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="station-offline-name">Tên Trạm (Tự động)</label>
              <input
                type="text"
                id="station-offline-name"
                value={stationOfflineForm.stationName}
                readOnly
                className="form-control"
                disabled
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi Thông Báo Trạm Offline'}
            </button>
          </form>
        </div>
      )}

      {/* Broadcast Form */}
      {activeTab === 'broadcast' && (
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
      )}
    </div>
  );
};

export default SystemNotificationsManagement;

