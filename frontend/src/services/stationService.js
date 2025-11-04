import apiClient from '../config/api';

// Get all stations
export const getAllStations = async () => {
    const response = await apiClient.get('/stations/getall');
    return response.data;
};

// Search stations with filters
export const searchStations = async (params = {}) => {
    const response = await apiClient.get('/stations/search', { params });
    return response.data;
};

// Get station by ID
export const getStationById = async (stationId) => {
    const response = await apiClient.get(`/stations/${stationId}`);
    return response.data;
};

// Get chargers by station ID
export const getStationChargers = async (stationId) => {
    const response = await apiClient.get(`/stations/${stationId}/chargers`);
    return response.data;
};

// Get charger by ID
export const getChargerById = async (chargerId) => {
    const response = await apiClient.get(`/chargers/${chargerId}`);
    return response.data;
};

// Update station
export const updateStation = async (stationId, updateData) => {
    const response = await apiClient.put(`/stations/${stationId}`, updateData);
    return response.data;
};

// Update station status
export const updateStationStatus = async (stationId, status) => {
    return updateStation(stationId, { status });
};

// Update charger status
export const updateChargerStatus = async (chargerId, status) => {
    const response = await apiClient.put(`/chargers/${chargerId}`, {
        status: status
    });
    return response.data;
};

// Reservations
export const createReservation = async (payload) => {
    const { stationId, chargerId, reservedStartTime, reservedEndTime, durationMinutes } = payload;
    const response = await apiClient.post('/reservations', {
        stationId, chargerId, reservedStartTime, reservedEndTime, durationMinutes
    });
    return response.data;
};

export const getMyReservations = async () => {
    const response = await apiClient.get('/reservations/me');
    return response.data;
};

export const cancelReservation = async (reservationId, reason) => {
    const response = await apiClient.put(`/reservations/${reservationId}/cancel`, null, { 
        params: { reason: reason || '' }
    });
    return response.data;
};

export const startSessionFromReservation = async (reservationId) => {
    const response = await apiClient.post(`/reservations/${reservationId}/start`);
    return response.data;
};

export const checkInReservation = async (reservationId) => {
    const response = await apiClient.post(`/reservations/${reservationId}/check-in`);
    return response.data;
};

// Start session from QR code
export const startSessionFromQRCode = async (qrCode) => {
    const response = await apiClient.post(`/reservations/qr/start`, null, {
        params: { qrCode }
    });
    return response.data;
};

import API_CONFIG from '../config/api';

class StationService {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');

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

    async getAllStations() {
        return this.request(API_CONFIG.ENDPOINTS.STATIONS.BASE);
    }

    async getStationById(id) {
        return this.request(`${API_CONFIG.ENDPOINTS.STATIONS.BASE}/${id}`);
    }

    async getStationChargers(stationId) {
        return this.request(`${API_CONFIG.ENDPOINTS.STATIONS.BASE}/${stationId}/chargers`);
    }

    async createStation(stationData) {
        return this.request(API_CONFIG.ENDPOINTS.STATIONS.BASE, {
            method: 'POST',
            body: stationData,
        });
    }

    async updateChargerStatus(chargerId, status) {
        return this.request(`${API_CONFIG.ENDPOINTS.STATIONS.CHARGERS}/${chargerId}`, {
            method: 'PUT',
            body: { status },
        });
    }
}

export default new StationService();