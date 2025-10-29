import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy redirect path từ location state hoặc mặc định là '/driver/profile'
  const from = location.state?.from?.pathname || '/driver/profile';

  console.log('🔐 Login Component Rendered ==========');
  console.log('📍 Redirect path:', from);
  console.log('📊 Current auth state - isAuthenticated:', isAuthenticated, 'user:', user, 'token:', token);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🚀 LOGIN PROCESS STARTED ==========');
    console.log('📝 Form data:', formData);
    console.log('🎯 Target redirect:', from);

    try {
      console.log('📤 Calling login function from AuthContext...');
      const result = await login(formData.email, formData.password);
      console.log('📥 Login function returned:', result);

      if (result.success) {
        console.log('✅ LOGIN SUCCESS!');
        console.log('👤 User data:', result.user);
        console.log('🔄 Navigating to:', from);

        // Kiểm tra lại auth state trước khi navigate
        console.log('📊 Re-checking auth state after login:');
        console.log('   - isAuthenticated:', isAuthenticated);
        console.log('   - user:', user);
        console.log('   - token:', token);

        navigate(from, { replace: true });
      } else {
        console.log('❌ LOGIN FAILED:', result.message);
        setError(result.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      console.log('💥 LOGIN CATCH ERROR:', err);
      console.log('🔍 Error details:');
      console.log('   - Error name:', err.name);
      console.log('   - Error message:', err.message);
      console.log('   - Error stack:', err.stack);
      setError('Lỗi kết nối đến server. Vui lòng thử lại.');
    } finally {
      console.log('🏁 Login process finished');
      console.log('⏳ Loading state set to false');
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
              <p>Hi chào bạn! Đăng nhập để tiếp tục</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <h2>Đăng nhập</h2>

              {/* Debug Info Panel - chỉ hiển thị trong development */}
              {import.meta.env.DEV && (
                  <div style={{
                    background: '#f0f8ff',
                    border: '1px solid #d1ecf1',
                    borderRadius: '5px',
                    padding: '10px',
                    marginBottom: '15px',
                    fontSize: '12px'
                  }}>
                    <strong>🔧 Debug Info:</strong>
                    <div>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</div>
                    <div>Loading: {loading ? 'true' : 'false'}</div>
                    <div>User: {user ? 'exists' : 'null'}</div>
                    <div>Token: {token ? 'exists' : 'null'}</div>
                  </div>
              )}

              {error && (
                  <div className="auth-error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                  </div>
              )}

              <div className="auth-input-group icon">
                <i className="fas fa-envelope"></i>
                <input
                    type="email"
                    name="email"
                    placeholder="admin@evstation.com"
                    value={formData.email}
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
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                />
              </div>

              <button
                  type="submit"
                  className="auth-btn-login"
                  disabled={loading}
              >
                {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Đang đăng nhập...
                    </>
                ) : (
                    'Đăng nhập'
                )}
              </button>

              <p className="auth-login-link">
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
              </p>

              {/* Test credentials for demo */}
              <div className="auth-test-credentials">
                <p><strong>Test Account:</strong></p>
                <p>Email: ptdat3000@gmail.com</p>
                <p>Password: 123123123</p>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default Login;