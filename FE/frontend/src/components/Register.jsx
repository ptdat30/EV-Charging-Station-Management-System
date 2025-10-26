// src/components/Register.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }
    console.log('Đăng ký:', formData);
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

            <div className="auth-input-group icon">
              <i className="fas fa-user"></i>
              <input
                type="text"
                name="name"
                placeholder="Tên quản trị viên trạm sạc"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

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
                placeholder="Mật khẩu bảo mật cao"
                value={formData.password}
                onChange={handleChange}
                required
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
              />
            </div>

            <button type="submit" className="auth-btn-register">
              Đăng ký
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