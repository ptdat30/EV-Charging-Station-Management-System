// src/components/admin/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../config/api';
import '../../styles/AdminSettingsPage.css';

const SettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'EVCharge Management System',
    companyName: 'EVCharge Vietnam',
    supportEmail: 'support@evcharge.vn',
    supportPhone: '1900-XXXX',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    maintenanceMode: false,
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    defaultCurrency: 'VND',
    minTopUpAmount: 50000,
    maxTopUpAmount: 50000000,
    walletEnabled: true,
    vnpayEnabled: true,
    momoEnabled: false,
    bankingEnabled: true,
    pricePerKwh: 3000,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    reservationReminder: true,
    chargingComplete: true,
    lowBalance: true,
    systemMaintenance: true,
  });

  // API Settings
  const [apiSettings, setApiSettings] = useState({
    apiRateLimit: 1000,
    apiKeyExpiry: 90,
    enableApiLogging: true,
    googleMapsApiKey: '',
    paymentGatewayUrl: '',
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    passwordMinLength: 6,
    requirePasswordChange: false,
    twoFactorAuth: false,
    ipWhitelist: '',
    maxLoginAttempts: 5,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Mock data - replace with API call when ready
      // const response = await apiClient.get('/admin/settings');
      // setGeneralSettings(response.data.general || generalSettings);
      // ...
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Không thể tải cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentSettings({
      ...paymentSettings,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value),
    });
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    });
  };

  const handleApiChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApiSettings({
      ...apiSettings,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value),
    });
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value),
    });
  };

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      // await apiClient.put('/admin/settings/general', generalSettings);
      setSuccess('Đã lưu cài đặt chung thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      // await apiClient.put('/admin/settings/payment', paymentSettings);
      setSuccess('Đã lưu cài đặt thanh toán thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotification = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      // await apiClient.put('/admin/settings/notification', notificationSettings);
      setSuccess('Đã lưu cài đặt thông báo thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApi = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      // await apiClient.put('/admin/settings/api', apiSettings);
      setSuccess('Đã lưu cài đặt API thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      // await apiClient.put('/admin/settings/security', securitySettings);
      setSuccess('Đã lưu cài đặt bảo mật thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (!window.confirm('Bạn có chắc chắn muốn đặt lại tất cả cài đặt về mặc định?')) {
      return;
    }
    // Reset to default values
    fetchSettings();
    alert('Đã đặt lại cài đặt về mặc định');
  };

  const tabs = [
    { id: 'general', label: 'Cài đặt chung', icon: 'fa-cog' },
    { id: 'payment', label: 'Thanh toán', icon: 'fa-credit-card' },
    { id: 'notification', label: 'Thông báo', icon: 'fa-bell' },
    { id: 'api', label: 'API & Tích hợp', icon: 'fa-code' },
    { id: 'security', label: 'Bảo mật', icon: 'fa-shield-alt' },
  ];

  return (
    <div className="settings-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Cài đặt Hệ thống</h2>
          <p>Quản lý các cài đặt và cấu hình hệ thống</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleResetSettings} disabled={loading}>
            <i className="fas fa-undo"></i>
            Đặt lại mặc định
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="message-banner success">
          <i className="fas fa-check-circle"></i>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="message-banner error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Settings Content */}
      <div className="settings-content">
        {/* General Settings */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="settings-form">
            <div className="settings-section">
              <h3>
                <i className="fas fa-info-circle"></i>
                Thông tin hệ thống
              </h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="systemName">
                    Tên hệ thống <span className="required">*</span>
                  </label>
                  <input
                    id="systemName"
                    type="text"
                    name="systemName"
                    value={generalSettings.systemName}
                    onChange={handleGeneralChange}
                    required
                    className="form-control"
                    disabled={loading}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="companyName">
                    Tên công ty <span className="required">*</span>
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    name="companyName"
                    value={generalSettings.companyName}
                    onChange={handleGeneralChange}
                    required
                    className="form-control"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="supportEmail">
                    Email hỗ trợ <span className="required">*</span>
                  </label>
                  <input
                    id="supportEmail"
                    type="email"
                    name="supportEmail"
                    value={generalSettings.supportEmail}
                    onChange={handleGeneralChange}
                    required
                    className="form-control"
                    disabled={loading}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="supportPhone">
                    Số điện thoại hỗ trợ
                  </label>
                  <input
                    id="supportPhone"
                    type="tel"
                    name="supportPhone"
                    value={generalSettings.supportPhone}
                    onChange={handleGeneralChange}
                    className="form-control"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="timezone">Múi giờ</label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={generalSettings.timezone}
                    onChange={handleGeneralChange}
                    className="form-control"
                    disabled={loading}
                  >
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="language">Ngôn ngữ</label>
                  <select
                    id="language"
                    name="language"
                    value={generalSettings.language}
                    onChange={handleGeneralChange}
                    className="form-control"
                    disabled={loading}
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={generalSettings.maintenanceMode}
                    onChange={handleGeneralChange}
                    disabled={loading}
                  />
                  <span>Chế độ bảo trì (Tắt hệ thống cho người dùng thường)</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Lưu cài đặt
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <form onSubmit={handleSavePayment} className="settings-form">
            <div className="settings-section">
              <h3>
                <i className="fas fa-money-bill-wave"></i>
                Cài đặt thanh toán
              </h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="defaultCurrency">Tiền tệ mặc định</label>
                  <select
                    id="defaultCurrency"
                    name="defaultCurrency"
                    value={paymentSettings.defaultCurrency}
                    onChange={handlePaymentChange}
                    className="form-control"
                    disabled={loading}
                  >
                    <option value="VND">VND (₫)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="pricePerKwh">
                    Giá điện (₫/kWh) <span className="required">*</span>
                  </label>
                  <input
                    id="pricePerKwh"
                    type="number"
                    name="pricePerKwh"
                    value={paymentSettings.pricePerKwh}
                    onChange={handlePaymentChange}
                    required
                    min="0"
                    step="100"
                    className="form-control"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="minTopUpAmount">
                    Nạp tiền tối thiểu (₫)
                  </label>
                  <input
                    id="minTopUpAmount"
                    type="number"
                    name="minTopUpAmount"
                    value={paymentSettings.minTopUpAmount}
                    onChange={handlePaymentChange}
                    min="0"
                    step="10000"
                    className="form-control"
                    disabled={loading}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="maxTopUpAmount">
                    Nạp tiền tối đa (₫)
                  </label>
                  <input
                    id="maxTopUpAmount"
                    type="number"
                    name="maxTopUpAmount"
                    value={paymentSettings.maxTopUpAmount}
                    onChange={handlePaymentChange}
                    min="0"
                    step="100000"
                    className="form-control"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="settings-subsection">
                <h4>Phương thức thanh toán</h4>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="walletEnabled"
                      checked={paymentSettings.walletEnabled}
                      onChange={handlePaymentChange}
                      disabled={loading}
                    />
                    <span>Ví điện tử</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="vnpayEnabled"
                      checked={paymentSettings.vnpayEnabled}
                      onChange={handlePaymentChange}
                      disabled={loading}
                    />
                    <span>VNPay</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="momoEnabled"
                      checked={paymentSettings.momoEnabled}
                      onChange={handlePaymentChange}
                      disabled={loading}
                    />
                    <span>MoMo</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="bankingEnabled"
                      checked={paymentSettings.bankingEnabled}
                      onChange={handlePaymentChange}
                      disabled={loading}
                    />
                    <span>Chuyển khoản ngân hàng</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Lưu cài đặt
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Notification Settings */}
        {activeTab === 'notification' && (
          <form onSubmit={handleSaveNotification} className="settings-form">
            <div className="settings-section">
              <h3>
                <i className="fas fa-bell"></i>
                Cài đặt thông báo
              </h3>
              <div className="settings-subsection">
                <h4>Kênh thông báo</h4>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="emailEnabled"
                      checked={notificationSettings.emailEnabled}
                      onChange={handleNotificationChange}
                      disabled={loading}
                    />
                    <span>Email</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="smsEnabled"
                      checked={notificationSettings.smsEnabled}
                      onChange={handleNotificationChange}
                      disabled={loading}
                    />
                    <span>SMS</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="pushEnabled"
                      checked={notificationSettings.pushEnabled}
                      onChange={handleNotificationChange}
                      disabled={loading}
                    />
                    <span>Push Notification</span>
                  </label>
                </div>
              </div>
              <div className="settings-subsection">
                <h4>Loại thông báo</h4>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="reservationReminder"
                      checked={notificationSettings.reservationReminder}
                      onChange={handleNotificationChange}
                      disabled={loading}
                    />
                    <span>Nhắc nhở đặt chỗ</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="chargingComplete"
                      checked={notificationSettings.chargingComplete}
                      onChange={handleNotificationChange}
                      disabled={loading}
                    />
                    <span>Sạc hoàn thành</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="lowBalance"
                      checked={notificationSettings.lowBalance}
                      onChange={handleNotificationChange}
                      disabled={loading}
                    />
                    <span>Số dư thấp</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="systemMaintenance"
                      checked={notificationSettings.systemMaintenance}
                      onChange={handleNotificationChange}
                      disabled={loading}
                    />
                    <span>Bảo trì hệ thống</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Lưu cài đặt
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* API Settings */}
        {activeTab === 'api' && (
          <form onSubmit={handleSaveApi} className="settings-form">
            <div className="settings-section">
              <h3>
                <i className="fas fa-code"></i>
                API & Tích hợp
              </h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="apiRateLimit">
                    Rate Limit (requests/minute)
                  </label>
                  <input
                    id="apiRateLimit"
                    type="number"
                    name="apiRateLimit"
                    value={apiSettings.apiRateLimit}
                    onChange={handleApiChange}
                    min="1"
                    className="form-control"
                    disabled={loading}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="apiKeyExpiry">
                    API Key hết hạn (ngày)
                  </label>
                  <input
                    id="apiKeyExpiry"
                    type="number"
                    name="apiKeyExpiry"
                    value={apiSettings.apiKeyExpiry}
                    onChange={handleApiChange}
                    min="1"
                    className="form-control"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="googleMapsApiKey">
                  Google Maps API Key
                </label>
                <input
                  id="googleMapsApiKey"
                  type="text"
                  name="googleMapsApiKey"
                  value={apiSettings.googleMapsApiKey}
                  onChange={handleApiChange}
                  className="form-control"
                  disabled={loading}
                  placeholder="AIza..."
                />
                <p className="form-caption">API key cho tính năng bản đồ</p>
              </div>
              <div className="form-field">
                <label htmlFor="paymentGatewayUrl">
                  Payment Gateway URL
                </label>
                <input
                  id="paymentGatewayUrl"
                  type="url"
                  name="paymentGatewayUrl"
                  value={apiSettings.paymentGatewayUrl}
                  onChange={handleApiChange}
                  className="form-control"
                  disabled={loading}
                  placeholder="https://..."
                />
              </div>
              <div className="form-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="enableApiLogging"
                    checked={apiSettings.enableApiLogging}
                    onChange={handleApiChange}
                    disabled={loading}
                  />
                  <span>Bật ghi log API requests</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Lưu cài đặt
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <form onSubmit={handleSaveSecurity} className="settings-form">
            <div className="settings-section">
              <h3>
                <i className="fas fa-shield-alt"></i>
                Cài đặt bảo mật
              </h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="sessionTimeout">
                    Session timeout (phút) <span className="required">*</span>
                  </label>
                  <input
                    id="sessionTimeout"
                    type="number"
                    name="sessionTimeout"
                    value={securitySettings.sessionTimeout}
                    onChange={handleSecurityChange}
                    required
                    min="5"
                    max="1440"
                    className="form-control"
                    disabled={loading}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="passwordMinLength">
                    Độ dài mật khẩu tối thiểu <span className="required">*</span>
                  </label>
                  <input
                    id="passwordMinLength"
                    type="number"
                    name="passwordMinLength"
                    value={securitySettings.passwordMinLength}
                    onChange={handleSecurityChange}
                    required
                    min="6"
                    max="32"
                    className="form-control"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="maxLoginAttempts">
                    Số lần đăng nhập tối đa
                  </label>
                  <input
                    id="maxLoginAttempts"
                    type="number"
                    name="maxLoginAttempts"
                    value={securitySettings.maxLoginAttempts}
                    onChange={handleSecurityChange}
                    min="3"
                    max="10"
                    className="form-control"
                    disabled={loading}
                  />
                  <p className="form-caption">Tài khoản sẽ bị khóa sau số lần sai mật khẩu</p>
                </div>
                <div className="form-field">
                  <label htmlFor="ipWhitelist">
                    IP Whitelist (tùy chọn)
                  </label>
                  <input
                    id="ipWhitelist"
                    type="text"
                    name="ipWhitelist"
                    value={securitySettings.ipWhitelist}
                    onChange={handleSecurityChange}
                    className="form-control"
                    disabled={loading}
                    placeholder="192.168.1.1, 10.0.0.1"
                  />
                  <p className="form-caption">Các IP được phép truy cập admin (phân cách bằng dấu phẩy)</p>
                </div>
              </div>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="requirePasswordChange"
                    checked={securitySettings.requirePasswordChange}
                    onChange={handleSecurityChange}
                    disabled={loading}
                  />
                  <span>Yêu cầu đổi mật khẩu định kỳ</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onChange={handleSecurityChange}
                    disabled={loading}
                  />
                  <span>Bật xác thực 2 yếu tố (2FA) cho admin</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Lưu cài đặt
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;