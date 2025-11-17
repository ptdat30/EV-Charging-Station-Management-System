// src/hooks/useModal.js
import { useState, useCallback } from 'react';

/**
 * Custom hook để quản lý Alert và Confirmation modals
 */
export const useModal = () => {
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    buttonText: 'Đóng'
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null,
    confirmText: 'Xác nhận',
    cancelText: 'Hủy'
  });

  const showAlert = useCallback((message, type = 'info', title = null) => {
    // Auto-detect type from message if not provided
    let detectedType = type;
    if (type === 'info' && message) {
      const msg = message.toLowerCase();
      if (msg.includes('✅') || msg.includes('thành công') || msg.includes('success')) {
        detectedType = 'success';
      } else if (msg.includes('❌') || msg.includes('lỗi') || msg.includes('error') || msg.includes('thất bại')) {
        detectedType = 'error';
      } else if (msg.includes('⚠️') || msg.includes('cảnh báo') || msg.includes('warning')) {
        detectedType = 'warning';
      }
    }

    // Extract title from message if not provided
    let alertTitle = title;
    if (!alertTitle && message) {
      const lines = message.split('\n');
      const firstLine = lines[0].trim();
      if (firstLine.length < 50 && (firstLine.includes('✅') || firstLine.includes('❌') || firstLine.includes('⚠️'))) {
        alertTitle = firstLine;
      }
    }

    setAlertModal({
      isOpen: true,
      title: alertTitle || 'Thông báo',
      message: message,
      type: detectedType,
      buttonText: 'Đóng'
    });
  }, []);

  const showConfirm = useCallback((message, onConfirm, options = {}) => {
    const {
      title = 'Xác nhận',
      type = 'warning',
      confirmText = 'Xác nhận',
      cancelText = 'Hủy'
    } = options;

    setConfirmModal({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      },
      confirmText,
      cancelText
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    alertModal,
    confirmModal,
    showAlert,
    showConfirm,
    closeAlert,
    closeConfirm
  };
};

