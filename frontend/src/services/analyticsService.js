// src/services/analyticsService.js
import axios from 'axios';

// Analytics Service runs on port 8087 (direct connection, not through API Gateway)
const ANALYTICS_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8087/api/analytics'  // Development
  : '/api/analytics';  // Production (adjust if needed)

// Create dedicated axios instance for analytics service
const analyticsClient = axios.create({
  baseURL: ANALYTICS_BASE_URL,
  timeout: 30000, // 30 seconds for analytics queries
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor - Add auth token
analyticsClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
analyticsClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      }
      error.message = data?.message || data?.error || error.message;
    } else if (error.request) {
      error.message = 'Không thể kết nối đến analytics service. Vui lòng kiểm tra kết nối mạng.';
    }
    return Promise.reject(error);
  }
);

/**
 * Get revenue analytics with time-series data
 * @param {Object} params - Query parameters
 * @param {number|null} params.stationId - Filter by station (null = all)
 * @param {string|null} params.region - Filter by region (null = all)
 * @param {string} params.from - Start date (ISO 8601: '2025-01-01T00:00:00')
 * @param {string} params.to - End date (ISO 8601: '2025-01-31T23:59:59')
 * @param {string} params.granularity - 'hour', 'day', 'week', 'month' (default: 'day')
 * @returns {Promise<Object>} Revenue response with dataPoints, totals, summary
 */
export const getRevenue = async (params) => {
  try {
    const queryParams = {
      from: params.from,
      to: params.to,
      ...(params.stationId && { stationId: params.stationId }),
      ...(params.region && { region: params.region }),
      ...(params.granularity && { granularity: params.granularity })
    };
    
    const response = await analyticsClient.get('/revenue', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
};

/**
 * Get usage analytics (sessions, energy, duration)
 * @param {Object} params - Query parameters
 * @param {number|null} params.stationId - Filter by station
 * @param {string|null} params.region - Filter by region
 * @param {string} params.from - Start date (ISO 8601)
 * @param {string} params.to - End date (ISO 8601)
 * @returns {Promise<Object>} Usage response with totals, topStations, stats
 */
export const getUsage = async (params) => {
  try {
    const queryParams = {
      from: params.from,
      to: params.to,
      ...(params.stationId && { stationId: params.stationId }),
      ...(params.region && { region: params.region })
    };
    
    const response = await analyticsClient.get('/usage', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching usage data:', error);
    throw error;
  }
};

/**
 * Get peak hours analysis (hourly distribution)
 * @param {Object} params - Query parameters
 * @param {number|null} params.stationId - Filter by station
 * @param {string|null} params.region - Filter by region
 * @param {string} params.from - Start date (ISO 8601)
 * @param {string} params.to - End date (ISO 8601)
 * @returns {Promise<Object>} PeakHours response with hourlyData and topPeakHours
 */
export const getPeakHours = async (params) => {
  try {
    const queryParams = {
      from: params.from,
      to: params.to,
      ...(params.stationId && { stationId: params.stationId }),
      ...(params.region && { region: params.region })
    };
    
    const response = await analyticsClient.get('/peak-hours', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching peak hours data:', error);
    throw error;
  }
};

/**
 * Get AI/ML forecast for future demand
 * @param {Object} params - Query parameters
 * @param {number|null} params.stationId - Forecast for specific station
 * @param {string|null} params.region - Forecast for specific region
 * @param {number} params.horizonMonths - Forecast horizon: 3, 6, or 12 months
 * @returns {Promise<Object>} Forecast response with forecastData, suggestions, summary
 */
export const getForecast = async (params) => {
  try {
    const queryParams = {
      horizonMonths: params.horizonMonths,
      ...(params.stationId && { stationId: params.stationId }),
      ...(params.region && { region: params.region })
    };
    
    const response = await analyticsClient.get('/forecast', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw error;
  }
};

/**
 * Trigger data sync from charging-service
 * POST /api/analytics/sync/trigger
 * @returns {Promise<Object>} Sync response with success, message, syncedCount
 */
export const triggerDataSync = async () => {
  try {
    const response = await analyticsClient.post('/sync/trigger');
    return response.data;
  } catch (error) {
    console.error('Error triggering data sync:', error);
    throw error;
  }
};

/**
 * Chat with AI assistant for infrastructure upgrade suggestions
 * POST /api/analytics/ai/chat
 * @param {Object} params - Chat parameters
 * @param {string} params.message - User's question/message
 * @param {string} params.context - Optional context ('revenue', 'usage', 'forecast', 'general')
 * @param {Object} params.analyticsData - Optional current analytics data for context
 * @param {Array} params.conversationHistory - Optional previous messages
 * @returns {Promise<Object>} AI chat response with response, suggestions, context
 */
export const chatWithAI = async (params) => {
  try {
    const response = await analyticsClient.post('/ai/chat', {
      message: params.message,
      context: params.context || 'general',
      analyticsData: params.analyticsData || {},
      conversationHistory: params.conversationHistory || []
    });
    return response.data;
  } catch (error) {
    console.error('Error chatting with AI:', error);
    throw error;
  }
};

export default analyticsClient;

