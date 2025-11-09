// src/context/AuthProvider.jsx
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../services/authService';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // Start with true to show loading while checking token
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Restore token from sessionStorage on mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                // Try to get token from sessionStorage first, then localStorage
                const savedToken = sessionStorage.getItem('token') || localStorage.getItem('token');
                
                if (savedToken) {
                    console.log('🔍 Found saved token, validating...');
                    setToken(savedToken);
                    
                    // Validate the token
                    try {
                        const userData = await authService.validateToken(savedToken);
                        console.log('✅ Token validation successful:', userData);
                        console.log('📦 Subscription Package:', userData?.subscriptionPackage);
                        console.log('📅 Subscription Expires At:', userData?.subscriptionExpiresAt);
                        setUser(userData);
                        setIsAuthenticated(true);
                    } catch (error) {
                        console.error('❌ Token validation failed:', error);
                        // Clear invalid token
                        sessionStorage.removeItem('token');
                        localStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                } else {
                    console.log('ℹ️ No saved token found');
                }
            } catch (error) {
                console.error('❌ Error restoring session:', error);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []); // Run only on mount

    const validateToken = async (tokenToValidate = token) => {
        if (!tokenToValidate) {
            console.warn('⚠️ No token provided for validation');
            return;
        }

        setLoading(true);
        try {
            console.log('🔍 Validating token...');
            const userData = await authService.validateToken(tokenToValidate);

            console.log('✅ Token validation successful:', userData);
            setUser(userData);
            setIsAuthenticated(true);
            setToken(tokenToValidate);
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
                // Save token to sessionStorage (you can also use localStorage for persistent login)
                sessionStorage.setItem('token', newToken);
                setToken(newToken);

                // Build user object from token validation
                const validated = await authService.validateToken(newToken);
                console.log('✅ Login validated user data:', validated);
                console.log('📦 Login - Subscription Package:', validated?.subscriptionPackage);
                console.log('📅 Login - Subscription Expires At:', validated?.subscriptionExpiresAt);
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
        console.log('🚪 Logging out...');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        // Clear token from both sessionStorage and localStorage
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        authService.logout();
    };

    const refreshUser = async () => {
        if (!token) {
            console.warn('⚠️ No token available to refresh user');
            return;
        }
        await validateToken(token);
    };

    const updateUser = (userData) => {
        setUser(prevUser => ({
            ...prevUser,
            ...userData
        }));
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        loading,
        isAuthenticated,
        refreshUser,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};