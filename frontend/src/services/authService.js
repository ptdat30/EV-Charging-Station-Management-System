// src/services/authService.js
import apiClient, { setAuthToken } from './api'; // Import instance apiClient

export const loginUser = async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.token) {
        localStorage.setItem('authToken', response.data.token); // Lưu token
        setAuthToken(response.data.token); // Set header mặc định cho các request sau
    }
    return response.data; // Chỉ trả về data (ví dụ: { token: "..." })
};

export const registerUser = async (userData) => {
    const response = await apiClient.post('/users/register', userData);
    return response.data; // Thường trả về thông tin user vừa tạo
};

// Hàm logout có thể đặt ở đây hoặc trong AuthContext
export const logoutUser = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null); // Xóa header mặc định
};