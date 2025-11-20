import apiClient from '../config/api';

// Get all maintenance schedules
export const getAllMaintenanceSchedules = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.stationId) params.append('stationId', filters.stationId);
    if (filters.status) params.append('status', filters.status);
    if (filters.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    
    const response = await apiClient.get(`/maintenance?${params.toString()}`);
    return response.data;
};

// Get maintenance schedule by ID
export const getMaintenanceScheduleById = async (scheduleId) => {
    const response = await apiClient.get(`/maintenance/${scheduleId}`);
    return response.data;
};

// Get schedules by station ID
export const getSchedulesByStationId = async (stationId) => {
    const response = await apiClient.get(`/maintenance?stationId=${stationId}`);
    return response.data;
};

// Get upcoming schedules
export const getUpcomingSchedules = async (from, to) => {
    const response = await apiClient.get(`/maintenance?from=${from}&to=${to}`);
    return response.data;
};

// Create maintenance schedule
export const createMaintenanceSchedule = async (scheduleData) => {
    const response = await apiClient.post('/maintenance', scheduleData);
    return response.data;
};

// Update maintenance schedule
export const updateMaintenanceSchedule = async (scheduleId, updateData) => {
    const response = await apiClient.put(`/maintenance/${scheduleId}`, updateData);
    return response.data;
};

// Start maintenance
export const startMaintenance = async (scheduleId) => {
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    const response = await apiClient.post(`/maintenance/${scheduleId}/start`,
        {},
        { headers: { 'X-User-Id': userId } }
    );
    return response.data;
};

// Complete maintenance
export const completeMaintenance = async (scheduleId, notes = '') => {
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    const response = await apiClient.post(`/maintenance/${scheduleId}/complete`,
        {},
        { 
            params: { notes },
            headers: { 'X-User-Id': userId } 
        }
    );
    return response.data;
};

// Delete maintenance schedule
export const deleteMaintenanceSchedule = async (scheduleId) => {
    const response = await apiClient.delete(`/maintenance/${scheduleId}`);
    return response.data;
};

