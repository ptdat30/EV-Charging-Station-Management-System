// src/components/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Đăng nhập:', formData);
    navigate('/driver/profile');
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

            <div className="auth-input-group icon">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                name="email"
                placeholder="admin@evstation.com"
                value={formData.email}
                onChange={handleChange}
                required
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
              />
            </div>

            <button type="submit" className="auth-btn-login">
              Đăng nhập
            </button>

            <p className="auth-login-link">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;