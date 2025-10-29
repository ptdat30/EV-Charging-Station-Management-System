import API_CONFIG from '../config/api';

class StationService {
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