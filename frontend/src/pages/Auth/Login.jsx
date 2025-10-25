// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth hook from context
import { loginUser } from '../../services/authService'; // Import loginUser from authService
import './Auth.css'; // Assuming you have some CSS for styling

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); // Get the login function from AuthContext

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        setError(null);         // Clear previous errors
        setLoading(true);       // Set loading state

        try {
            // Call the loginUser function from authService
            const loginData = await loginUser({ email, password }); // authService now returns { token: "..." }

            // If loginUser is successful, call the login function from AuthContext
            // This will update the global state and handle navigation
            login(loginData.token);

        } catch (err) {
            // Handle errors (e.g., incorrect credentials, network issues)
            console.error('Login failed:', err.response?.data || err.message || err);
            const errorMessage = err.response?.data?.message || err.response?.data || 'Login failed. Please check your credentials.';
            setError(errorMessage);
        } finally {
            setLoading(false); // Reset loading state regardless of success or failure
        }
    };

    return (
        <div className="auth-container"> {/* Use a general container class */}
            <div className="auth-card">    {/* Use a card styling class */}
                <h2>Đăng nhập</h2>
                <form onSubmit={handleSubmit} className="auth-form"> {/* Use a general form class */}
                    {/* Email Input */}
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Nhập email của bạn"
                            className="form-input"
                            aria-label="Email Address"
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
                            aria-label="Password"
                        />
                    </div>

                    {/* Error Display */}
                    {error && <div className="error-message">{error}</div>}

                    {/* Submit Button */}
                    <button type="submit" disabled={loading} className="auth-btn"> {/* Use a general button class */}
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
                {/* Optional: Add link to Register page */}
                {/* <p>Don't have an account? <Link to="/register">Register here</Link></p> */}
            </div>
        </div>
    );
}

export default LoginPage;