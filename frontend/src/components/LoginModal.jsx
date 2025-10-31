import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginModal.css';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ email: '', password: '' });
      setError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  // Close modal when user is authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

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

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Redirect theo role của user
        const userRole = (result.user?.role || result.user?.roles?.[0] || '').toUpperCase();
        let redirectPath = '/dashboard';

        switch (userRole) {
          case 'DRIVER':
            redirectPath = '/dashboard';
            break;
          case 'ADMIN':
            redirectPath = '/admin';
            break;
          case 'STAFF':
            redirectPath = '/dashboard';
            break;
          default:
            redirectPath = '/dashboard';
        }

        onClose();
        navigate(redirectPath, { replace: true });
      } else {
        setError(result.message || 'Email hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose} aria-label="Đóng">
          <i className="fas fa-times"></i>
        </button>

        <div className="login-modal-content">
          {/* Header Section */}
          <div className="login-modal-header">
            <div className="login-modal-logo">
              <span>EV</span>
            </div>
            <h2 className="login-modal-title">Chào mừng bạn trở lại!</h2>
            <p className="login-modal-subtitle">Đăng nhập để tiếp tục trải nghiệm</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-modal-form">
            {/* Error Message */}
            {error && (
              <div className="login-error-message">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Email/Phone Field */}
            <div className="login-input-group">
              <label htmlFor="login-email" className="login-label">
                Email / Số điện thoại
              </label>
              <div className="login-input-wrapper">
                <i className="fas fa-envelope login-input-icon"></i>
                <input
                  id="login-email"
                  type="text"
                  name="email"
                  placeholder="Nhập email hoặc số điện thoại"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="login-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="login-input-group">
              <label htmlFor="login-password" className="login-label">
                Mật khẩu
              </label>
              <div className="login-input-wrapper">
                <i className="fas fa-lock login-input-icon"></i>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="login-input"
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="login-forgot-password">
              <Link to="/forgot-password" onClick={onClose} className="forgot-password-link">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Đăng nhập</span>
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="login-register-link">
              <span>Bạn chưa có tài khoản?</span>
              {onSwitchToRegister ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setTimeout(() => onSwitchToRegister(), 100);
                  }}
                  className="register-link-text"
                >
                  Đăng ký ngay
                </button>
              ) : (
                <Link to="/register" onClick={onClose} className="register-link-text">
                  Đăng ký ngay
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

