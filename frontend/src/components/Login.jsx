import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Debug chỉ trong dev
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Login Render | Auth:', { isAuthenticated, user, token });
    }
  }, [isAuthenticated, user, token]);

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
        let redirectPath = from;

        // Nếu đang ở homepage hoặc login page, redirect theo role
        if (from === '/' || from === '/login') {
          switch (userRole) {
            case 'DRIVER':
              redirectPath = '/dashboard';
              break;
            case 'ADMIN':
              redirectPath = '/admin';
              break;
            case 'STAFF':
              redirectPath = '/dashboard'; // Staff có thể dùng dashboard chung hoặc tạo riêng sau
              break;
            default:
              redirectPath = '/dashboard';
          }
        }

        navigate(redirectPath, { replace: true });
      } else {
        setError(result.message || 'Email hoặc mật khẩu không đúng');
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            {/* Logo & Header */}
            <div className="login-header">
              <div className="logo-circle">
                <span>EV</span>
              </div>
              <h1>EV Station</h1>
              <p className="welcome-text">Chào mừng bạn trở lại!</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              <h2>Đăng nhập</h2>

              {/* Debug Panel (Dev Only) */}
              {import.meta.env.DEV && (
                  <div className="debug-panel">
                    <small>
                      <strong>Debug:</strong> Auth: {isAuthenticated ? '✓' : '✗'} |
                      User: {user ? '✓' : '✗'} |
                      Loading: {loading ? '⏳' : '○'}
                    </small>
                  </div>
              )}

              {/* Error Message */}
              {error && (
                  <div className="error-message">
                    <i className="fas fa-exclamation-triangle"></i>
                    {error}
                  </div>
              )}

              {/* Email Field */}
              <div className="input-group">
                <div className="input-wrapper">
                  <i className="fas fa-envelope icon"></i>
                  <input
                      type="email"
                      name="email"
                      placeholder="admin@evstation.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="input-group">
                <div className="input-wrapper">
                  <i className="fas fa-lock icon"></i>
                  <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Mật khẩu"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      autoComplete="current-password"
                  />
                  <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                    <>
                      <span className="spinner"></span>
                      Đang đăng nhập...
                    </>
                ) : (
                    'Đăng nhập'
                )}
              </button>

              {/* Register Link */}
              <p className="register-link">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="link">
                  Đăng ký ngay
                </Link>
              </p>

              {/* Demo Credentials */}
              <div className="demo-credentials">
                <p><strong>Tài khoản thử nghiệm:</strong></p>
                <p className="cred">Email: <code>ptdat3000@gmail.com</code></p>
                <p className="cred">Mật khẩu: <code>123123123</code></p>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default Login;