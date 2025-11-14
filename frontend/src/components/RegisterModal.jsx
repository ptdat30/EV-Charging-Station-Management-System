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
          {/* Header Section - GitHub Style */}
          <div className="register-modal-header">
            <div className="register-modal-logo">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="8" fill="#1e293b"/>
                <path d="M24 12L16 20H24V12Z" fill="white"/>
                <path d="M24 36L32 28H24V36Z" fill="white"/>
              </svg>
            </div>
            <h1 className="register-modal-title">Tạo tài khoản mới</h1>
            <p className="register-modal-subtitle">Chúng tôi rất vui được chào đón bạn!</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-modal-form">
            {/* Error Message */}
            {error && (
              <div className="register-error-message">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M8.22 1.754a3.25 3.25 0 00-4.44 0L1.754 3.78a3.25 3.25 0 000 4.44L3.78 9.936a3.25 3.25 0 004.44 0l2.006-2.005a3.25 3.25 0 000-4.44L8.22 1.754zM4.75 4a.75.75 0 00-.75.75v.5a.75.75 0 001.5 0v-.5A.75.75 0 004.75 4zm0 5a.75.75 0 00-.75.75v.5a.75.75 0 001.5 0v-.5A.75.75 0 004.75 9zm5-5a.75.75 0 00-.75.75v.5a.75.75 0 001.5 0v-.5A.75.75 0 009.75 4zm0 5a.75.75 0 00-.75.75v.5a.75.75 0 001.5 0v-.5a.75.75 0 00-.75-.75z"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Full Name Field */}
            <div className="register-input-group">
              <label htmlFor="register-fullName" className="register-label">
                Họ và tên đầy đủ
              </label>
              <input
                id="register-fullName"
                type="text"
                name="fullName"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="name"
                className="register-input"
              />
            </div>

            {/* Email Field */}
            <div className="register-input-group">
              <label htmlFor="register-email" className="register-label">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
                className="register-input"
              />
            </div>

            {/* Phone Field */}
            <div className="register-input-group">
              <label htmlFor="register-phone" className="register-label">
                Số điện thoại
              </label>
              <input
                id="register-phone"
                type="tel"
                name="phone"
                placeholder="0123456789"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="tel"
                className="register-input"
              />
            </div>

            {/* Password Field */}
            <div className="register-input-group">
              <label htmlFor="register-password" className="register-label">
                Mật khẩu
              </label>
              <div className="register-input-wrapper">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Ít nhất 6 ký tự"
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
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="register-input-group">
              <label htmlFor="register-confirmPassword" className="register-label">
                Xác nhận mật khẩu
              </label>
              <div className="register-input-wrapper">
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
                  {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="register-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="register-spinner"></span>
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                <span>Tạo tài khoản</span>
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
                  Đăng nhập
                </button>
              ) : (
                <Link to="/login" onClick={onClose} className="login-link-text">
                  Đăng nhập
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

