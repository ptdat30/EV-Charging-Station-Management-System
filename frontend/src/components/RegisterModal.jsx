import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/RegisterModal.css';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
      setError('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
        onClose();
        // Điều hướng sang trang xác minh
        navigate('/verify', { 
          state: {
            email: formData.email,
            password: formData.password
          }
        });
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


  const handleSwitchToLogin = () => {
    onClose();
    if (onSwitchToLogin) {
      setTimeout(() => onSwitchToLogin(), 100);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="register-modal-overlay" onClick={onClose}>
      <div className="register-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="register-modal-close" onClick={onClose} aria-label="Đóng">
          <i className="fas fa-times"></i>
        </button>

        <div className="register-modal-content">
          {/* Header Section */}
          <div className="register-modal-header">
            <div className="register-modal-logo">
              <span>EV</span>
            </div>
            <h2 className="register-modal-title">Tạo tài khoản mới</h2>
            <p className="register-modal-subtitle">Tham gia mạng lưới trạm sạc xe điện</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-modal-form">
            {/* Error Message */}
            {error && (
              <div className="register-error-message">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Full Name Field */}
            <div className="register-input-group">
              <label htmlFor="register-fullName" className="register-label">
                Họ và tên đầy đủ
              </label>
              <div className="register-input-wrapper">
                <i className="fas fa-user register-input-icon"></i>
                <input
                  id="register-fullName"
                  type="text"
                  name="fullName"
                  placeholder="Nhập họ và tên"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="name"
                  className="register-input"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="register-input-group">
              <label htmlFor="register-email" className="register-label">
                Email
              </label>
              <div className="register-input-wrapper">
                <i className="fas fa-envelope register-input-icon"></i>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="register-input"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="register-input-group">
              <label htmlFor="register-phone" className="register-label">
                Số điện thoại
              </label>
              <div className="register-input-wrapper">
                <i className="fas fa-phone register-input-icon"></i>
                <input
                  id="register-phone"
                  type="tel"
                  name="phone"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="tel"
                  className="register-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="register-input-group">
              <label htmlFor="register-password" className="register-label">
                Mật khẩu
              </label>
              <div className="register-input-wrapper">
                <i className="fas fa-lock register-input-icon"></i>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Mật khẩu (ít nhất 6 ký tự)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="register-input"
                  minLength="6"
                />
                <button
                  type="button"
                  className="register-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="register-input-group">
              <label htmlFor="register-confirmPassword" className="register-label">
                Xác nhận mật khẩu
              </label>
              <div className="register-input-wrapper">
                <i className="fas fa-lock register-input-icon"></i>
                <input
                  id="register-confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="register-input"
                />
                <button
                  type="button"
                  className="register-toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="register-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="register-spinner"></span>
                  <span>Đang đăng ký...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  <span>Đăng ký</span>
                </>
              )}
            </button>
            {/* Login Link */}
            <div className="register-login-link">
              <span>Bạn đã có tài khoản?</span>
              {onSwitchToLogin ? (
                <button
                  type="button"
                  onClick={handleSwitchToLogin}
                  className="login-link-text"
                >
                  Đăng nhập ngay
                </button>
              ) : (
                <Link to="/login" onClick={onClose} className="login-link-text">
                  Đăng nhập ngay
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;

