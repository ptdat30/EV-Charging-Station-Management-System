import API_CONFIG from '../config/api';

class SessionService {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = localStorage.getItem('token');

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...options.headers,
            },
            ...options,
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async startSession(sessionData) {
        return this.request(API_CONFIG.ENDPOINTS.SESSIONS.START, {
            method: 'POST',
            body: sessionData,
        });
    }

    async stopSession(sessionId) {
        return this.request(`${API_CONFIG.ENDPOINTS.SESSIONS.BASE}/${sessionId}/stop`, {
            method: 'POST',
        });
    }

    async getSession(sessionId) {
        return this.request(`${API_CONFIG.ENDPOINTS.SESSIONS.BASE}/${sessionId}`);
    }

    async getAllSessions() {
        return this.request(API_CONFIG.ENDPOINTS.SESSIONS.BASE);
    }

    async cancelSession(sessionId) {
        return this.request(`${API_CONFIG.ENDPOINTS.SESSIONS.BASE}/${sessionId}/cancel`, {
            method: 'POST',
        });
    }
}

export default new SessionService();