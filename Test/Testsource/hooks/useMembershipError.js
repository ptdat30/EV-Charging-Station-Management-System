import { useState, useCallback } from 'react';

const useMembershipError = () => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleApiError = useCallback((error) => {
    // Kiểm tra nếu là lỗi 401 hoặc 403
    if (error.response) {
      const { status, data } = error.response;
      
      // Lỗi 401 - Unauthorized (token hết hạn hoặc không hợp lệ)
      if (status === 401) {
        const message = data?.message || 'Phiên đăng nhập đã hết hạn';
        
        // Kiểm tra nếu là lỗi membership-related
        const isMembershipError = message.toLowerCase().includes('membership') || 
                                 message.toLowerCase().includes('upgrade') ||
                                 message.toLowerCase().includes('nâng cấp') ||
                                 message.toLowerCase().includes('thành viên') ||
                                 message.toLowerCase().includes('access') ||
                                 message.toLowerCase().includes('plan') ||
                                 message.toLowerCase().includes('trial') ||
                                 message.toLowerCase().includes('guest') ||
                                 message.toLowerCase().includes('restricted');
        
        if (isMembershipError) {
          setErrorMessage('Bạn cần nâng cấp lên thành viên để truy cập tính năng này');
          setShowUpgradeModal(true);
          return true; // Đã xử lý
        }
      }
      
      // Lỗi 403 - Forbidden (không có quyền truy cập)
      if (status === 403) {
        const message = data?.message || 'Bạn không có quyền truy cập tính năng này';
        setErrorMessage(message);
        setShowUpgradeModal(true);
        return true; // Đã xử lý
      }
    }
    
    return false; // Chưa xử lý
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setShowUpgradeModal(false);
    setErrorMessage('');
  }, []);

  return {
    showUpgradeModal,
    errorMessage,
    handleApiError,
    closeUpgradeModal
  };
};

export default useMembershipError; 