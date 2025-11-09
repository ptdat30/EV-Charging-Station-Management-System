// src/services/userService.js
import apiClient from '../config/api';

/**
 * Lấy thông tin profile của user hiện tại
 * Backend tự động lấy userId từ JWT token
 */
export const getMyProfile = async () => {
    try {
        const response = await apiClient.get('/users/profile');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Cập nhật thông tin profile của user hiện tại
 * @param {object} profileData - Dữ liệu cần cập nhật
 * @returns {Promise}
 */
export const updateMyProfile = async (profileData) => {
    try {
        console.log('📤 Updating user profile...', profileData);
        const response = await apiClient.put('/users/profile', profileData);
        console.log('✅ Profile updated:', response.data);
        return response;
    } catch (error) {
        console.error('❌ Failed to update profile:', error);
        throw error;
    }
};

/**
 * Đổi mật khẩu
 * @param {object} passwords - { currentPassword, newPassword, confirmPassword }
 */
export const changePassword = async (passwords) => {
    try {
        console.log('🔐 Changing password...');
        const response = await apiClient.put('/users/change-password', passwords);
        console.log('✅ Password changed successfully');
        return response;
    } catch (error) {
        console.error('❌ Failed to change password:', error);
        throw error;
    }
};

/**
 * Upload avatar
 * @param {FormData} formData - Form data chứa file ảnh
 */
export const uploadAvatar = async (formData) => {
    try {
        console.log('📸 Uploading avatar...');
        const response = await apiClient.post('/users/profile/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log('✅ Avatar uploaded:', response.data);
        return response;
    } catch (error) {
        console.error('❌ Failed to upload avatar:', error);
        throw error;
    }
};

/**
 * Lấy danh sách xe của user
 */
export const getMyVehicles = async () => {
    try {
        const response = await apiClient.get('/users/vehicles');
        return response;
    } catch (error) {
        console.error('Failed to fetch vehicles:', error);
        throw error;
    }
};

/**
 * Thêm xe mới
 * @param {object} vehicleData - Thông tin xe
 */
export const addVehicle = async (vehicleData) => {
    try {
        const response = await apiClient.post('/users/vehicles', vehicleData);
        return response;
    } catch (error) {
        console.error('Failed to add vehicle:', error);
        throw error;
    }
};

export const updateVehicle = async (vehicleId, vehicleData) => {
    try {
        const response = await apiClient.put(`/users/vehicles/${vehicleId}`, vehicleData);
        return response;
    } catch (error) {
        console.error('Failed to update vehicle:', error);
        throw error;
    }
};

export const setDefaultVehicle = async (vehicleId) => {
    return updateVehicle(vehicleId, { isDefault: true });
};

export const getMyTransactionsHistory = async () => {
    try {
        console.log('🧾 Fetching transactions history...');
        const response = await apiClient.get('/transactions/history');
        // Backend trả về List<SessionResponseDto> trực tiếp trong response body
        // response.data có thể là array hoặc {data: [...]}
        const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        return { data };
    } catch (error) {
        console.error('❌ Failed to fetch history:', error);
        throw error;
    }
};

/**
 * Xóa xe
 * @param {number} vehicleId - ID của xe cần xóa
 */
export const deleteVehicle = async (vehicleId) => {
    try {
        console.log('🗑️ Deleting vehicle:', vehicleId);
        const response = await apiClient.delete(`/users/vehicles/${vehicleId}`);
        console.log('✅ Vehicle deleted');
        return response;
    } catch (error) {
        console.error('❌ Failed to delete vehicle:', error);
        throw error;
    }
};

/**
 * Lấy danh sách tất cả người dùng (Admin only)
 * @returns {Promise}
 */
export const getAllUsers = async () => {
    try {
        console.log('📋 Fetching all users...');
        const response = await apiClient.get('/users/getall');
        console.log('✅ All users fetched:', response.data);
        return response;
    } catch (error) {
        console.error('❌ Failed to fetch all users:', error);
        throw error;
    }
};