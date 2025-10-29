import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config/config';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(false); // Dùng để xử lý trạng thái loading chung

    // Hàm này sẽ chạy mỗi khi token thay đổi để lấy thông tin người dùng
    useEffect(() => {
        if (token) {
            localStorage.setItem('authToken', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Tùy chọn: Bạn có thể thêm một endpoint /me hoặc /profile để lấy thông tin user
            // Ví dụ: axios.get(`${config.API_BASE_URL}/users/me`).then(res => setUser(res.data));
        } else {
            localStorage.removeItem('authToken');
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const login = async (credentials) => {
        setLoading(true);
        try {
            // Gọi API đăng nhập từ backend của bạn
            const response = await axios.post(`${config.API_BASE_URL}${config.endpoints.login}`, credentials);

            // Giả sử backend trả về một đối tượng có chứa token và thông tin user
            const { token: authToken, user: userInfo } = response.data;

            setToken(authToken);
            setUser(userInfo); // Cập nhật thông tin người dùng
            setLoading(false);
            return response.data; // Trả về data để LoginPage có thể xử lý (ví dụ: chuyển trang)

        } catch (error) {
            setLoading(false);
            // Ném lỗi ra để component LoginPage có thể bắt và hiển thị
            throw error.response?.data || new Error("Lỗi không xác định");
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };

    // isAuthenticated có thể được tính toán trực tiếp từ sự tồn tại của token
    const isAuthenticated = !!token;

    const value = {
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};