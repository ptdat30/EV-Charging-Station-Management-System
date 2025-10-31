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
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`🔄 API Request: ${config.method.toUpperCase()} ${config.url}`);
        console.log('   Headers:', config.headers);
        if (config.data) {
            console.log('   Data:', config.data);
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor - Xử lý response và lỗi
apiClient.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        console.log('   Data:', response.data);
        return response;
    },
    (error) => {
        // Log chi tiết lỗi
        console.error('❌ API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });

        // Xử lý các mã lỗi cụ thể
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    console.log('🔒 Unauthorized - Clearing token and redirecting to login');
                    localStorage.removeItem('token');

                    // Chỉ redirect nếu không phải đang ở trang login
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                    break;

                case 403:
                    console.log('🚫 Forbidden - Access denied');
                    break;

                case 404:
                    console.log('🔍 Not Found');
                    break;

                case 500:
                    console.log('💥 Internal Server Error');
                    break;

                default:
                    console.log(`⚠️ Error ${status}`);
            }

            // Trả về lỗi với message từ backend hoặc default
            error.message = data?.message || data?.error || error.message;
        } else if (error.request) {
            // Request được gửi nhưng không nhận được response
            console.error('📡 No response received:', error.request);
            error.message = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else {
            // Lỗi trong quá trình setup request
            console.error('⚙️ Request setup error:', error.message);
        }

        return Promise.reject(error);
    }
);

// Export
export default apiClient;
export { API_CONFIG };