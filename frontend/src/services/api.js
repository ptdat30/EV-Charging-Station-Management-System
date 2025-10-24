// src/services/api.js
import axios from 'axios';

// Tạo một instance Axios với cấu hình cơ bản
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api', // Base URL của API Gateway
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Authentication ---
export const loginUser = (credentials) => {
    // credentials object: { email: "...", password: "..." }
    return apiClient.post('/auth/login', credentials);
};

// --- User Management ---
export const registerUser = (userData) => {
    // userData object: { email: "...", password: "...", fullName: "...", phone: "..." }
    return apiClient.post('/users/register', userData);
};

// Hàm để lấy danh sách users (ví dụ)
export const getAllUsers = (token) => {
    return apiClient.get('/users/getall', {
        headers: {
            Authorization: `Bearer ${token}` // Gắn token vào header
        }
    });
};

// --- Thêm các hàm gọi API khác ở đây (stations, chargers, sessions,...) ---

export default apiClient; // Xuất instance để có thể dùng trực tiếp nếu cần