// src/context/AuthProvider.jsx
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../services/authService';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        console.log('🔄 AuthProvider mounted, token:', token ? 'exists' : 'none');

        if (token) {
            validateToken();
        } else {
            setLoading(false);
        }
    }, []); // Chỉ chạy 1 lần khi mount

    const validateToken = async () => {
        try {
            console.log('🔍 Validating token...');
            const userData = await authService.validateToken(token);

            console.log('✅ Token validation successful:', userData);
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('❌ Token validation failed:', error);
            logout(); // Clear invalid token
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('🔐 Attempting login with:', email);
            const response = await authService.login(email, password);

            if (response.token) {
                const newToken = response.token;

                console.log('✅ Login successful, validating token to get user profile');
                localStorage.setItem('token', newToken);
                setToken(newToken);

                // Build user object from token validation
                const validated = await authService.validateToken(newToken);
                setUser(validated);
                setIsAuthenticated(true);

                return { success: true, user: validated };
            } else {
                console.log('❌ Login failed - no token in response');
                return {
                    success: false,
                    message: response.message || 'Đăng nhập thất bại - Không nhận được token'
                };
            }
        } catch (error) {
            console.error('❌ Login error:', error);

            let errorMessage = 'Lỗi kết nối đến server';

            if (error.response) {
                // Server trả về lỗi
                const status = error.response.status;
                const data = error.response.data;

                switch (status) {
                    case 401:
                        errorMessage = 'Email hoặc mật khẩu không đúng';
                        break;
                    case 403:
                        errorMessage = 'Tài khoản của bạn đã bị khóa';
                        break;
                    case 404:
                        errorMessage = 'Không tìm thấy tài khoản';
                        break;
                    case 500:
                        errorMessage = 'Lỗi server. Vui lòng thử lại sau';
                        break;
                    default:
                        errorMessage = data?.message || 'Đăng nhập thất bại';
                }
            } else if (error.request) {
                // Request được gửi nhưng không nhận được response
                errorMessage = 'Không thể kết nối đến server. Kiểm tra kết nối mạng.';
            } else {
                // Lỗi khác
                errorMessage = error.message || 'Lỗi không xác định';
            }

            return { success: false, message: errorMessage };
        }
    };

    const register = async (userData) => {
        try {
            console.log('📝 Attempting registration:', userData.email);
            const response = await authService.register(userData);

            if (response.id || response.userId) {
                console.log('✅ Registration successful:', response);
                return { success: true, data: response };
            } else {
                return {
                    success: false,
                    message: response.message || 'Đăng ký thất bại'
                };
            }
        } catch (error) {
            console.error('❌ Registration error:', error);

            let errorMessage = 'Lỗi kết nối đến server';

            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;

                switch (status) {
                    case 400:
                        errorMessage = data?.message || 'Dữ liệu không hợp lệ';
                        break;
                    case 409:
                        errorMessage = 'Email đã được sử dụng';
                        break;
                    case 500:
                        errorMessage = 'Lỗi server. Vui lòng thử lại sau';
                        break;
                    default:
                        errorMessage = data?.message || 'Đăng ký thất bại';
                }
            } else if (error.request) {
                errorMessage = 'Không thể kết nối đến server. Kiểm tra kết nối mạng.';
            } else {
                errorMessage = error.message || 'Lỗi không xác định';
            }

            return { success: false, message: errorMessage };
        }
    };

    const logout = () => {
        console.log('👋 Logging out...');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        authService.logout();
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