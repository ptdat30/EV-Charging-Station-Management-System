// src/services/loyaltyService.js
import api from '../config/api';

/**
 * Get loyalty account by user ID
 * @param {number} userId 
 * @returns {Promise}
 */
export const getLoyaltyAccount = async (userId) => {
  try {
    const response = await api.get(`/loyalty/account?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching loyalty account:', error);
    throw error;
  }
};

/**
 * Create new loyalty account
 * @param {number} userId 
 * @returns {Promise}
 */
export const createLoyaltyAccount = async (userId) => {
  try {
    const response = await api.post('/loyalty/account', { userId });
    return response.data;
  } catch (error) {
    console.error('Error creating loyalty account:', error);
    throw error;
  }
};

/**
 * Get points transactions by user ID
 * @param {number} userId 
 * @returns {Promise}
 */
export const getPointsTransactions = async (userId) => {
  try {
    const response = await api.get(`/loyalty/transactions?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching points transactions:', error);
    throw error;
  }
};

/**
 * Redeem points
 * @param {Object} redeemData - {userId, points, description, referenceType, referenceId}
 * @returns {Promise}
 */
export const redeemPoints = async (redeemData) => {
  try {
    const response = await api.post('/loyalty/redeem', redeemData);
    return response.data;
  } catch (error) {
    console.error('Error redeeming points:', error);
    throw error;
  }
};

/**
 * Get tier information based on tier level
 * @param {string} tierLevel 
 * @returns {Object}
 */
export const getTierInfo = (tierLevel) => {
  const tiers = {
    bronze: {
      name: 'Đồng',
      iconClass: 'fas fa-medal',
      gradient: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 50%, #CD7F32 100%)',
      color: '#CD7F32',
      benefits: ['Tích điểm cơ bản', 'Ưu đãi 5%']
    },
    silver: {
      name: 'Bạc',
      iconClass: 'fas fa-medal',
      gradient: 'linear-gradient(135deg, #E8E8E8 0%, #A8A8A8 50%, #D3D3D3 100%)',
      color: '#C0C0C0',
      benefits: ['Tích điểm x1.2', 'Ưu đãi 10%', 'Ưu tiên đặt chỗ']
    },
    gold: {
      name: 'Vàng',
      iconClass: 'fas fa-medal',
      gradient: 'linear-gradient(135deg, #FFD700 0%, #DAA520 50%, #FFD700 100%)',
      color: '#FFD700',
      benefits: ['Tích điểm x1.5', 'Ưu đãi 15%', 'Ưu tiên cao', 'Tặng 100 điểm/tháng']
    },
    platinum: {
      name: 'Bạch Kim',
      iconClass: 'fas fa-medal',
      gradient: 'linear-gradient(135deg, #F0F0F0 0%, #B0B0B0 50%, #E0E0E0 100%)',
      color: '#E5E4E2',
      benefits: ['Tích điểm x2', 'Ưu đãi 20%', 'VIP hỗ trợ', 'Tặng 500 điểm/tháng']
    },
    diamond: {
      name: 'Kim Cương',
      iconClass: 'fas fa-gem',
      gradient: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 50%, #87CEEB 100%)',
      color: '#4682B4',
      benefits: ['Tích điểm x3', 'Ưu đãi 30%', 'Dedicated support', 'Tặng 1000 điểm/tháng', 'Miễn phí đặt chỗ']
    }
  };

  return tiers[tierLevel?.toLowerCase()] || tiers.bronze;
};

/**
 * Format points with thousand separator
 * @param {number} points 
 * @returns {string}
 */
export const formatPoints = (points) => {
  return points?.toLocaleString('vi-VN') || '0';
};

