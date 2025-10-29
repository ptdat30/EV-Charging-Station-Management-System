const API_CONFIG = {
    BASE_URL: 'http://localhost:8080',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/auth/login',
            REGISTER: '/api/users/register',
            VALIDATE: '/api/auth/validate'
        },
        USERS: {
            BASE: '/api/users',
            PROFILE: '/api/users/profile'
        },
        STATIONS: {
            BASE: '/api/stations',
            CHARGERS: '/api/chargers'
        },
        SESSIONS: {
            BASE: '/api/sessions',
            START: '/api/sessions/start',
            STOP: '/api/sessions/{id}/stop'
        },
        WALLETS: {
            BASE: '/api/wallets'
        }
    }
};

export default API_CONFIG;