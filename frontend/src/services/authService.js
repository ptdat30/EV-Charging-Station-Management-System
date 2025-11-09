// src/services/authService.js
// Sử dụng absolute URL để tránh vấn đề với proxy
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
    ? 'http://localhost:8080/api'  // Development: dùng trực tiếp API Gateway
    : '/api';  // Production: dùng proxy hoặc relative path

class AuthService {
    /**
     * Phương thức chung để gửi request.
     * @param {string} endpoint - Đường dẫn endpoint, ví dụ: '/auth/login'. KHÔNG bao gồm /api.
     * @param {object} options - Cấu hình request (method, headers, body).
     */
    async request(endpoint, options = {}) {
        // Sử dụng absolute URL để đảm bảo request đến đúng API Gateway
        const url = `${API_BASE_URL}${endpoint}`;

        console.log('🔄 Making request to API Gateway:', url);

        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                body: options.body ? JSON.stringify(options.body) : undefined,
            });

            console.log('✅ Response status:', response.status);

            if (!response.ok) {
                // Sẽ ném ra lỗi nếu status là 4xx hoặc 5xx
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Xử lý response body, có thể không có body cho PUT/DELETE
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log('✅ Response data:', data);
                return data;
            }

            // Trả về response object nếu không có body JSON
            return response;

        } catch (error) {
            console.error('❌ Request failed:', error);
            throw error;
        }
    }

    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: { email, password },
        });
    }

    async validateToken(token) {
        const result = await this.request(`/auth/validate?token=${encodeURIComponent(token)}`, {
            method: 'GET',
        });
        // result: { isValid, username, role, userId, subscriptionPackage, subscriptionExpiresAt, avatarUrl, fullName }
        // Backend trả về role dạng lowercase (staff, driver, admin)
        console.log('🔍 Token validation result:', result);
        if (result?.isValid) {
            // Backend trả về role dạng lowercase: "staff", "driver", "admin"
            const role = result.role || result.userType || 'UNKNOWN';
            const userData = {
                email: result.username,
                role: role, // role từ backend là "staff", "driver", "admin" (lowercase)
                userType: role, // Tương tự role
                userId: result.userId,
                fullName: result.fullName || null,
                avatarUrl: result.avatarUrl || null,
                subscriptionPackage: result.subscriptionPackage || null,
                subscriptionExpiresAt: result.subscriptionExpiresAt || null,
            };
            console.log('✅ Validated user data:', userData);
            console.log('🖼️ Avatar URL:', userData.avatarUrl);
            return userData;
        }
        throw new Error('Invalid token');
    }

    logout() {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
    }

    async register(userData) {
        return this.request('/users/register', {
            method: 'POST',
            body: userData,
        });
    }
}

export const authService = new AuthService();