import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginModal.css';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const loginSuccessRef = useRef(false); // Track if login was successful from this modal

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ email: '', password: '' });
      setError('');
      setShowPassword(false);
      loginSuccessRef.current = false; // Reset success flag when modal opens
    }
  }, [isOpen]);

  // Close modal when user is authenticated ONLY if login was successful from this modal
  useEffect(() => {
    if (isAuthenticated && isOpen && loginSuccessRef.current) {
      onClose();
      loginSuccessRef.current = false; // Reset after closing
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
        // Set flag to indicate login was successful from this modal
        loginSuccessRef.current = true;
        
        // Redirect theo role ca user
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
          {/* Header Section - GitHub Style */}
          <div className="login-modal-header">
            <div className="login-modal-logo">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="8" fill="#1e293b"/>
                <path d="M24 12L16 20H24V12Z" fill="white"/>
                <path d="M24 36L32 28H24V36Z" fill="white"/>
              </svg>
            </div>
            <h1 className="login-modal-title">Đăng nhập vào EV Charging</h1>
            <p className="login-modal-subtitle">Chúng tôi rất vui được gặp lại bạn!</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-modal-form">
            {/* Error Message */}
            {error && (
              <div className="login-error-message">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M8.22 1.754a3.25 3.25 0 00-4.44 0L1.754 3.78a3.25 3.25 0 000 4.44L3.78 9.936a3.25 3.25 0 004.44 0l2.006-2.005a3.25 3.25 0 000-4.44L8.22 1.754zM4.75 4a.75.75 0 00-.75.75v.5a.75.75 0 001.5 0v-.5A.75.75 0 004.75 4zm0 5a.75.75 0 00-.75.75v.5a.75.75 0 001.5 0v-.5A.75.75 0 004.75 9zm5-5a.75.75 0 00-.75.75v.5a.75.75 0 001.5 0v-.5A.75.75 0 009.75 4zm0 5a.75.75 0 00-.75.75v.5a.75.75 0 001.5 0v-.5a.75.75 0 00-.75-.75z"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Email/Phone Field */}
            <div className="login-input-group">
              <label htmlFor="login-email" className="login-label">
                Email hoặc số điện thoại
              </label>
              <input
                id="login-email"
                type="text"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
                className="login-input"
              />
            </div>

            {/* Password Field */}
            <div className="login-input-group">
              <div className="login-label-row">
                <label htmlFor="login-password" className="login-label">
                  Mật khẩu
                </label>
              </div>
              <div className="login-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Nhập mật khẩu của bạn"
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
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
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
                  Tạo tài khoản
                </button>
              ) : (
                <Link to="/register" onClick={onClose} className="register-link-text">
                  Tạo tài khoản
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

