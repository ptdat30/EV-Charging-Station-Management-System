// src/components/AlertModal.jsx
import React from 'react';
import '../styles/AlertModal.css';

const AlertModal = ({ isOpen, onClose, title, message, type = 'info', buttonText = 'Đóng' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'error':
      case 'danger':
        return 'fas fa-times-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'success':
        return 'fas fa-check-circle';
      default:
        return 'fas fa-info-circle';
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'error':
      case 'danger':
        return 'alert-modal-danger';
      case 'warning':
        return 'alert-modal-warning';
      case 'success':
        return 'alert-modal-success';
      default:
        return 'alert-modal-info';
    }
  };

  return (
    <div className="alert-modal-overlay" onClick={onClose}>
      <div className={`alert-modal ${getTypeClass()}`} onClick={(e) => e.stopPropagation()}>
        <div className="alert-modal-header">
          <div className="alert-modal-icon">
            <i className={getIcon()}></i>
          </div>
          {title && <h3>{title}</h3>}
        </div>
        <div className="alert-modal-body">
          {message && (
            <div className="alert-message">
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
        <div className="alert-modal-footer">
          <button className="btn-close" onClick={onClose}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

