// src/services/passwordResetAPI.js
const API_BASE_URL = 'http://localhost:8080/api/auth';

export const passwordResetAPI = {
    // Gửi OTP đến email
    sendResetOTP: async (email) => {
        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            return {
                success: data.success || response.ok,
                message: data.message || 'Đã gửi OTP',
                errors: data.errors
            };
        } catch (error) {
            console.error('API Error:', error);
            throw new Error('Không thể kết nối đến server');
        }
    },

    // Xác thực OTP và đặt lại mật khẩu
    verifyOTPAndResetPassword: async (email, otp, newPassword) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    otp,
                    newPassword
                }),
            });

            const data = await response.json();

            return {
                success: data.success || response.ok,
                message: data.message || 'Đặt lại mật khẩu thành công',
                errors: data.errors
            };
        } catch (error) {
            console.error('API Error:', error);
            throw new Error('Không thể kết nối đến server');
        }
    },
};