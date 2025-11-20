import apiClient from '../config/api';

// Get all incidents
export const getAllIncidents = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.stationId) params.append('stationId', filters.stationId);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.type) params.append('type', filters.type);
    if (filters.severity) params.append('severity', filters.severity);
    
    const response = await apiClient.get(`/incidents?${params.toString()}`);
    return response.data;
};

// Get active incidents (pending + in_progress)
export const getActiveIncidents = async () => {
    const response = await apiClient.get('/incidents/active');
    return response.data;
};

// Get incident by ID
export const getIncidentById = async (incidentId) => {
    const response = await apiClient.get(`/incidents/${incidentId}`);
    return response.data;
};

// Get incidents by station ID
export const getIncidentsByStationId = async (stationId) => {
    const response = await apiClient.get(`/incidents?stationId=${stationId}`);
    return response.data;
};

// Get incidents by assigned staff
export const getIncidentsByAssignedTo = async (assignedTo) => {
    const response = await apiClient.get(`/incidents/assigned/${assignedTo}`);
    return response.data;
};

// Get incident history
export const getIncidentHistory = async (incidentId) => {
    const response = await apiClient.get(`/incidents/${incidentId}/history`);
    return response.data;
};

// Get incident statistics
export const getIncidentStatistics = async () => {
    const response = await apiClient.get('/incidents/statistics');
    return response.data;
};

// Create incident
export const createIncident = async (incidentData) => {
    const response = await apiClient.post('/incidents', incidentData);
    return response.data;
};

// Update incident
export const updateIncident = async (incidentId, updateData) => {
    const response = await apiClient.put(`/incidents/${incidentId}`, updateData);
    return response.data;
};

// Assign incident to staff
export const assignIncident = async (incidentId, assignedTo, notes = '') => {
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    const response = await apiClient.post(`/incidents/${incidentId}/assign`, 
        { assignedTo, notes },
        { headers: { 'X-User-Id': userId } }
    );
    return response.data;
};

// Update incident priority
export const updateIncidentPriority = async (incidentId, priority, notes = '') => {
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    const response = await apiClient.put(`/incidents/${incidentId}/priority`,
        { priority, notes },
        { headers: { 'X-User-Id': userId } }
    );
    return response.data;
};

// Resolve incident
export const resolveIncident = async (incidentId, resolutionNotes, resolutionRating = null) => {
    const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    const response = await apiClient.post(`/incidents/${incidentId}/resolve`,
        { resolutionNotes, resolutionRating },
        { headers: { 'X-User-Id': userId } }
    );
    return response.data;
};

