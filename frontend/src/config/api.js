// src/config/api.js
import axios from 'axios';

// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api', // Sử dụng proxy, để trống
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/users/register',
            VALIDATE: '/auth/validate'
        },
        USERS: {
            BASE: '/users',
            PROFILE: '/users/profile'
        },
        STATIONS: {
            BASE: '/stations',
            CHARGERS: '/chargers'
        },
        SESSIONS: {
            BASE: '/sessions',
            START: '/sessions/start',
            STOP: (id) => `/sessions/${id}/stop`
        },
        WALLETS: {
            BASE: '/wallets'
        }
    }
};

// Tạo axios instance
// Sử dụng absolute URL để tránh vấn đề với proxy
const isDevelopment = import.meta.env.DEV;
const apiBaseURL = isDevelopment 
    ? 'http://localhost:8080/api'  // Development: dùng trực tiếp API Gateway
    : '/api';  // Production: dùng proxy hoặc relative path

const apiClient = axios.create({
    baseURL: apiBaseURL,
    timeout: 15000, // 15 giây
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor - Tự động thêm token
// Note: X-User-Id sẽ được API Gateway AuthenticationFilter tự động thêm từ token
apiClient.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor - Xử lý response và lỗi
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Xử lý các mã lỗi cụ thể
        if (error.response) {
            const { status, data } = error.response;

            if (status === 401) {
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
            }

            // Trả về lỗi với message từ backend hoặc default
            error.message = data?.message || data?.error || error.message;
        } else if (error.request) {
            error.message = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        }

        return Promise.reject(error);
    }
);

// Export
export default apiClient;
export { API_CONFIG };