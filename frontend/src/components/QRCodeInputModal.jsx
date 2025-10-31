// src/components/QRCodeInputModal.jsx
import React, { useState } from 'react';
import { startSessionFromQRCode } from '../services/stationService';
import '../styles/QRCodeInputModal.css';

const QRCodeInputModal = ({ isOpen, onClose, onSuccess }) => {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!qrCode.trim()) {
      setError('Vui lòng nhập mã QR code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const session = await startSessionFromQRCode(qrCode.trim());
      alert(`✅ Đã bắt đầu phiên sạc thành công!\n\nSession ID: ${session.sessionId || 'N/A'}`);
      onSuccess && onSuccess(session);
      onClose();
      setQrCode('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể bắt đầu phiên sạc';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQrCode('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="qr-modal-overlay" onClick={handleClose}>
      <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal-header">
          <h2>
            <i className="fas fa-qrcode"></i>
            Nhập QR Code (Dev Mode)
          </h2>
          <button className="qr-modal-close" onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="qr-modal-body">
          <p className="qr-modal-description">
            <i className="fas fa-info-circle"></i>
            Trong môi trường dev, bạn có thể nhập QR code thủ công thay vì quét bằng camera.
          </p>

          {error && (
            <div className="qr-modal-error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="qr-input-group">
              <label htmlFor="qrCode">
                <i className="fas fa-barcode"></i>
                Mã QR Code
              </label>
              <input
                id="qrCode"
                type="text"
                value={qrCode}
                onChange={(e) => {
                  setQrCode(e.target.value);
                  setError('');
                }}
                placeholder="Nhập QR code từ reservation..."
                disabled={loading}
                autoFocus
              />
              <small>Nhập QR code từ reservation để bắt đầu phiên sạc</small>
            </div>

            <div className="qr-modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading || !qrCode.trim()}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play"></i>
                    Bắt đầu sạc
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QRCodeInputModal;

