// src/pages/Auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { registerUser } from '../../services/authService'; // Import registerUser
import './Auth.css'; // Dùng chung CSS với Login

function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        const userData = { email, password, fullName, phone };

        try {
            await registerUser(userData);
            console.log('Registration successful!');
            // Chuyển hướng đến trang Login sau khi đăng ký thành công
            navigate('/'); // Hoặc '/login' nếu bạn đổi route index
            alert('Đăng ký thành công! Vui lòng đăng nhập.'); // Thông báo cho người dùng

        } catch (err) {
            console.error('Registration failed:', err.response?.data || err.message || err);
            const errorMessage = err.response?.data?.message || err.response?.data || 'Registration failed. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Đăng ký tài khoản</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Full Name Input */}
                    <div className="form-group">
                        <label htmlFor="fullName">Họ và Tên:</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="Nhập họ và tên"
                            className="form-input"
                        />
                    </div>

                    {/* Email Input */}
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Nhập email"
                            className="form-input"
                        />
                    </div>

                    {/* Phone Input */}
                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại:</label>
                        <input
                            type="tel" // Kiểu 'tel' cho số điện thoại
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            // required // Có thể không bắt buộc
                            placeholder="Nhập số điện thoại (tùy chọn)"
                            className="form-input"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Nhập mật khẩu"
                            className="form-input"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                </form>
                <p className="auth-switch">
                    Đã có tài khoản? <Link to="/">Đăng nhập tại đây</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;