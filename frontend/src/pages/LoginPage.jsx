// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); // Get the login function from context

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission
        setError(null);
        setLoading(true);

        try {
            const response = await loginUser({ email, password });
            const token = response.data.token;
            console.log('Login successful! Token:', token);

            // Call the login function from context to update state and navigate
            login(token);

        } catch (err) {
            console.error('Login failed:', err.response?.data || err.message);
            // Try to get a more specific error message from the backend if available
            const errorMessage = err.response?.data?.message || err.response?.data || 'Login failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                {/* Email Input Field */}
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Nhập email của bạn"
                        aria-label="Email Address" // Added for accessibility
                    />
                </div>

                {/* Password Input Field */}
                <div>
                    <label htmlFor="password">Mật khẩu:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Nhập mật khẩu"
                        aria-label="Password" // Added for accessibility
                    />
                </div>

                {/* Error Message Display */}
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

                {/* Submit Button */}
                <button type="submit" disabled={loading} style={{ marginTop: '15px' }}>
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;