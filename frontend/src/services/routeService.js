// src/services/routeService.js
import apiClient from '../config/api';

/**
 * Create multiple reservations for a route (chain booking)
 * @param {Array} bookings - Array of booking objects with stationId, chargerId, reservedStartTime, reservedEndTime, durationMinutes, order
 * @returns {Promise<Array>} Array of created reservation objects
 */
export const createRouteReservations = async (bookings) => {
  try {
    const response = await apiClient.post('/reservations/route', {
      bookings
    });
    return response.data;
  } catch (error) {
    console.error('Error creating route reservations:', error);
    throw error;
  }
};

/**
 * Cancel a route reservation and auto-cancel subsequent ones
 * @param {Number} reservationId - ID of the reservation to cancel
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelRouteReservation = async (reservationId) => {
  try {
    const response = await apiClient.put(`/reservations/${reservationId}/cancel-route`);
    return response.data;
  } catch (error) {
    console.error('Error canceling route reservation:', error);
    throw error;
  }
};
