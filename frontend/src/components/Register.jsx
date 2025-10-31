import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleName: '',
    vehicleBatteryKwh: '',
    preferredChargerType: 'AC',
    defaultPaymentMethod: 'WALLET'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for BE
      const registerData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: 'driver'
      };

      const result = await register(registerData);

      if (result.success) {
        console.log('Đăng ký thành công:', result.data);
        // Điều hướng sang trang xác minh (tự động xác minh/demo)
        navigate('/verify', { state: {
          email: formData.email,
          password: formData.password,
          vehicle: {
            name: formData.vehicleName,
            batteryCapacityKwh: formData.vehicleBatteryKwh ? Number(formData.vehicleBatteryKwh) : null,
            preferredChargerType: formData.preferredChargerType,
            isDefault: true,
          },
          defaultPaymentMethod: formData.defaultPaymentMethod
        }});
      } else {
        setError(result.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối đến server. Vui lòng thử lại.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo-icon">EV</div>
              <h1>EV Station</h1>
              <p>Hệ thống quản lý trạm sạc xe điện thông minh</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <h2>Tạo tài khoản mới</h2>
              <p className="auth-subtitle">Tham gia mạng lưới trạm sạc xe điện hiện đại</p>

              {error && (
                  <div className="auth-error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                  </div>
              )}

              <div className="auth-input-group icon">
                <i className="fas fa-user"></i>
                <input
                    type="text"
                    name="fullName"
                    placeholder="Họ và tên đầy đủ"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                />
              </div>

              <div className="auth-input-group icon">
                <i className="fas fa-envelope"></i>
                <input
                    type="email"
                    name="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                />
              </div>

              <div className="auth-input-group icon">
                <i className="fas fa-phone"></i>
                <input
                    type="tel"
                    name="phone"
                    placeholder="Số điện thoại"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={loading}
                />
              </div>

              <div className="auth-input-group icon">
                <i className="fas fa-lock"></i>
                <input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu (ít nhất 6 ký tự)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength="6"
                />
              </div>

              <div className="auth-input-group icon">
                <i className="fas fa-lock"></i>
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                />
              </div>

              {/* Vehicle Info */}
              <h3 style={{marginTop:'1rem'}}>Thông tin xe</h3>
              <div className="auth-input-group">
                <input
                    type="text"
                    name="vehicleName"
                    placeholder="Tên xe (VD: VinFast VF e34)"
                    value={formData.vehicleName}
                    onChange={handleChange}
                />
              </div>
              <div className="auth-input-group">
                <input
                    type="number"
                    name="vehicleBatteryKwh"
                    placeholder="Dung lượng pin (kWh)"
                    value={formData.vehicleBatteryKwh}
                    onChange={handleChange}
                    min="0"
                />
              </div>
              <div className="auth-input-group">
                <select name="preferredChargerType" value={formData.preferredChargerType} onChange={handleChange}>
                  <option value="AC">AC</option>
                  <option value="DC">DC</option>
                </select>
              </div>

              {/* Default Payment */}
              <h3 style={{marginTop:'1rem'}}>Phương thức thanh toán mặc định</h3>
              <div className="auth-input-group">
                <select name="defaultPaymentMethod" value={formData.defaultPaymentMethod} onChange={handleChange}>
                  <option value="WALLET">Ví điện tử</option>
                  <option value="BANK">Ngân hàng</option>
                  <option value="MOMO">Momo</option>
                  <option value="VISA">Visa/MasterCard</option>
                </select>
              </div>

              <button
                  type="submit"
                  className="auth-btn-register"
                  disabled={loading}
              >
                {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Đang đăng ký...
                    </>
                ) : (
                    'Đăng ký'
                )}
              </button>

              <p className="auth-login-link">
                Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
  );
};

export default Register;