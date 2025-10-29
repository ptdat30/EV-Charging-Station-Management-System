// src/context/AuthProvider.jsx
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext'; // Import từ file mới
import { authService } from '../services/authService';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        console.log('AuthProvider mounted, token:', token ? 'exists' : 'none');
        if (token) {
            validateToken();
        } else {
            setLoading(false);
        }
    }, []);

    const validateToken = async () => {
        try {
            console.log('Validating token...');
            const userData = await authService.validateToken(token);
            console.log('Token validation successful:', userData);
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Token validation failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('Attempting login with:', email);
            const response = await authService.login(email, password);
            console.log('Login API response:', response);

            if (response.token) {
                const { token: newToken, user: userData } = response;

                console.log('Login successful, setting token and user');
                setToken(newToken);
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('token', newToken);

                return { success: true, user: userData };
            } else {
                console.log('Login failed - no token in response');
                return {
                    success: false,
                    message: response.message || 'Đăng nhập thất bại - Không nhận được token'
                };
            }
        } catch (error) {
            console.error('Login error details:', error);
            let errorMessage = 'Lỗi kết nối đến server';

            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Không thể kết nối đến server. Kiểm tra kết nối mạng.';
            } else if (error.message.includes('CORS')) {
                errorMessage = 'Lỗi CORS. Kiểm tra cấu hình server.';
            } else {
                errorMessage = error.message || 'Lỗi không xác định';
            }

            return { success: false, message: errorMessage };
        }
    };

    const register = async (userData) => {
        try {
            console.log('Attempting registration:', userData);
            const response = await authService.register(userData);
            console.log('Registration API response:', response);

            if (response.id || response.userId) {
                return { success: true, data: response };
            } else {
                return {
                    success: false,
                    message: response.message || 'Đăng ký thất bại'
                };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: error.message || 'Lỗi kết nối đến server'
            };
        }
    };

    const logout = () => {
        console.log('Logging out...');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        loading,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};