// src/components/ConfirmationModal.jsx
import React from 'react';
import '../styles/ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Xác nhận', cancelText = 'Hủy', type = 'warning' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return 'fas fa-exclamation-circle';
      case 'info':
        return 'fas fa-info-circle';
      case 'success':
        return 'fas fa-check-circle';
      default:
        return 'fas fa-exclamation-triangle';
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'danger':
        return 'confirmation-modal-danger';
      case 'info':
        return 'confirmation-modal-info';
      case 'success':
        return 'confirmation-modal-success';
      default:
        return 'confirmation-modal-warning';
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="confirmation-modal-overlay" onClick={onClose}>
      <div className={`confirmation-modal ${getTypeClass()}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-modal-header">
          <div className="confirmation-modal-icon">
            <i className={getIcon()}></i>
          </div>
          {title && <h3>{title}</h3>}
        </div>
        <div className="confirmation-modal-body">
          {message && (
            <div className="confirmation-message">
              {typeof message === 'string' ? (
                message.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))
              ) : (
                <p>{message}</p>
              )}
            </div>
          )}
        </div>
        <div className="confirmation-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

