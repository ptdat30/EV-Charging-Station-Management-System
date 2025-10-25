// src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api', // API Gateway base URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to set the auth token for subsequent requests
const setAuthToken = (token) => {
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

// --- Authentication ---
export const loginUser = async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    // Set token after successful login
    if (response.data.token) {
        setAuthToken(response.data.token);
    }
    return response;
};

// --- User Management ---
export const registerUser = (userData) => {
    return apiClient.post('/users/register', userData);
};

export const getAllUsers = () => { // Removed token argument, relies on default header
    return apiClient.get('/users/getall');
};

// --- Charging Sessions ---
export const startChargingSession = (sessionData) => {
    // sessionData: { userId, stationId, chargerId }
    return apiClient.post('/sessions/start', sessionData);
};

export const stopChargingSession = (sessionId) => {
    return apiClient.post(`/sessions/${sessionId}/stop`);
};

// --- Add other API functions here ---

export default apiClient;