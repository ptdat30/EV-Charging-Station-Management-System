// src/services/walletService.js
import apiClient from '../config/api';

/**
 * Lấy thông tin wallet (balance + transactions)
 */
export const getWallet = async () => {
    try {
        const response = await apiClient.get('/wallets');
        return response.data;
    } catch (err) {
        // Fallback to /wallet/balance if /wallets doesn't exist
        if (err.response?.status === 404) {
            const balanceRes = await getBalance();
            return {
                balance: balanceRes.balance || 0,
                transactions: []
            };
        }
        throw err;
    }
};

/**
 * Lấy balance
 */
export const getBalance = async () => {
    const response = await apiClient.get('/wallet/balance');
    return response.data;
};

/**
 * Nạp tiền vào ví
 */
export const topUpWallet = async (amount) => {
    const response = await apiClient.post('/wallet/deposit', null, {
        params: { amount }
    });
    return response.data;
};

/**
 * Lấy lịch sử giao dịch
 */
export const getTransactions = async (page = 0, size = 20) => {
    const response = await apiClient.get('/payments/my-transactions', {
        params: { page, size }
    });
    return response.data;
};

