// src/components/QRCodeModal.jsx
import React from 'react';
import QRCode from 'react-qr-code';
import '../styles/QRCodeModal.css';

const QRCodeModal = ({ isOpen, onClose, qrCode, title = 'QR Code' }) => {
  if (!isOpen) return null;

  return (
    <div className="qrcode-modal-overlay" onClick={onClose}>
      <div className="qrcode-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qrcode-modal-header">
          <h3>
            <i className="fas fa-qrcode"></i>
            {title}
          </h3>
          <button className="qrcode-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="qrcode-modal-body">
          {qrCode ? (
            <>
              <div className="qrcode-container">
                <QRCode
                  value={qrCode}
                  size={256}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  viewBox="0 0 256 256"
                />
              </div>
              <div className="qrcode-text">
                <p>
                  <i className="fas fa-info-circle"></i>
                  Mã QR Code của bạn
                </p>
                <p className="qrcode-value">{qrCode}</p>
                <p className="qrcode-hint">
                  Quét mã QR này để bắt đầu phiên sạc tại trạm
                </p>
              </div>
            </>
          ) : (
            <div className="qrcode-error">
              <i className="fas fa-exclamation-triangle"></i>
              <p>Không có mã QR Code</p>
            </div>
          )}
        </div>
        <div className="qrcode-modal-footer">
          <button className="btn-close" onClick={onClose}>
            <i className="fas fa-times"></i>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;

