// src/services/favoritesService.js
// Temporary implementation using localStorage
// TODO: Implement backend API for favorites

const STORAGE_KEY = 'user_favorite_stations';

/**
 * Get user's favorite stations
 * @returns {Array} Array of favorite station IDs
 */
export const getFavoriteStations = () => {
  try {
    const favorites = localStorage.getItem(STORAGE_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
};

/**
 * Add a station to favorites
 * @param {number} stationId 
 * @returns {boolean} Success status
 */
export const addFavoriteStation = (stationId) => {
  try {
    const favorites = getFavoriteStations();
    if (!favorites.includes(stationId)) {
      favorites.push(stationId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      console.log('✅ Added station to favorites:', stationId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
};

/**
 * Remove a station from favorites
 * @param {number} stationId 
 * @returns {boolean} Success status
 */
export const removeFavoriteStation = (stationId) => {
  try {
    const favorites = getFavoriteStations();
    const filtered = favorites.filter(id => id !== stationId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log('✅ Removed station from favorites:', stationId);
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
};

/**
 * Check if a station is in favorites
 * @param {number} stationId 
 * @returns {boolean}
 */
export const isFavoriteStation = (stationId) => {
  const favorites = getFavoriteStations();
  return favorites.includes(stationId);
};

