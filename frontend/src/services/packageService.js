// src/services/packageService.js
import apiClient from '../config/api';

/**
 * Lấy danh sách tất cả gói dịch vụ
 * @returns {Promise}
 */
export const getAllPackages = async () => {
    try {
        console.log('📦 Fetching all packages...');
        const response = await apiClient.get('/packages/getall');
        console.log('✅ All packages fetched:', response.data);
        return response;
    } catch (error) {
        console.error('❌ Failed to fetch packages:', error);
        throw error;
    }
};

/**
 * Lấy gói dịch vụ theo ID
 * @param {number} packageId - ID của gói dịch vụ
 * @returns {Promise}
 */
export const getPackageById = async (packageId) => {
    try {
        console.log('📦 Fetching package:', packageId);
        const response = await apiClient.get(`/packages/${packageId}`);
        console.log('✅ Package fetched:', response.data);
        return response;
    } catch (error) {
        console.error('❌ Failed to fetch package:', error);
        throw error;
    }
};

/**
 * Tạo gói dịch vụ mới
 * @param {object} packageData - Thông tin gói dịch vụ
 * @returns {Promise}
 */
export const createPackage = async (packageData) => {
    try {
        console.log('➕ Creating package...', packageData);
        const response = await apiClient.post('/packages', packageData);
        console.log('✅ Package created:', response.data);
        return response;
    } catch (error) {
        console.error('❌ Failed to create package:', error);
        throw error;
    }
};

/**
 * Cập nhật gói dịch vụ
 * @param {number} packageId - ID của gói dịch vụ
 * @param {object} packageData - Thông tin cập nhật
 * @returns {Promise}
 */
export const updatePackage = async (packageId, packageData) => {
    try {
        console.log('✏️ Updating package...', packageId, packageData);
        const response = await apiClient.put(`/packages/${packageId}`, packageData);
        console.log('✅ Package updated:', response.data);
        return response;
    } catch (error) {
        console.error('❌ Failed to update package:', error);
        throw error;
    }
};

/**
 * Xóa gói dịch vụ
 * @param {number} packageId - ID của gói dịch vụ
 * @returns {Promise}
 */
export const deletePackage = async (packageId) => {
    try {
        console.log('🗑️ Deleting package:', packageId);
        const response = await apiClient.delete(`/packages/${packageId}`);
        console.log('✅ Package deleted');
        return response;
    } catch (error) {
        console.error('❌ Failed to delete package:', error);
        throw error;
    }
};

/**
 * Kích hoạt/vô hiệu hóa gói dịch vụ
 * @param {number} packageId - ID của gói dịch vụ
 * @param {boolean} isActive - Trạng thái kích hoạt
 * @returns {Promise}
 */
export const togglePackageStatus = async (packageId, isActive) => {
    try {
        console.log('🔄 Toggling package status...', packageId, isActive);
        const response = await apiClient.put(`/packages/${packageId}/status`, { isActive });
        console.log('✅ Package status updated:', response.data);
        return response;
    } catch (error) {
        console.error('❌ Failed to toggle package status:', error);
        throw error;
    }
};
