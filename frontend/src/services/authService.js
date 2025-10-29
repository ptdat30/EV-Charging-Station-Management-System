// DÙNG PROXY - relative path
const API_BASE_URL = '';

class AuthService {
    async request(endpoint, options = {}) {
        const url = `/api${endpoint}`; // Proxy sẽ chuyển đến BE

        console.log('🔄 Making request via PROXY:', url);

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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Response data:', data);
            return data;

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

    async register(userData) {
        return this.request('/users/register', {
            method: 'POST',
            body: userData,
        });
    }
}

export const authService = new AuthService();