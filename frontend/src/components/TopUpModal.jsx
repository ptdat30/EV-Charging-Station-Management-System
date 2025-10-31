// src/components/TopUpModal.jsx
import React, { useState } from 'react';
import { topUpWallet } from '../services/walletService';
import '../styles/TopUpModal.css';

const TopUpModal = ({ isOpen, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Predefined amounts
    const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

    const handleQuickAmount = (quickAmount) => {
        setAmount(quickAmount.toString());
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const amountNum = parseFloat(amount);
        if (!amount || isNaN(amountNum) || amountNum <= 0) {
            setError('Vui lòng nhập số tiền hợp lệ (lớn hơn 0)');
            return;
        }

        if (amountNum < 10000) {
            setError('Số tiền tối thiểu là 10,000 ₫');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await topUpWallet(amountNum);
            alert(`✅ Nạp tiền thành công!\n\nSố tiền: ${amountNum.toLocaleString('vi-VN')} ₫\nSố dư mới: ${result.balance?.toLocaleString('vi-VN') || 'N/A'} ₫`);
            onSuccess && onSuccess(result);
            onClose();
            setAmount('');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Không thể nạp tiền. Vui lòng thử lại.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setAmount('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="topup-modal-overlay" onClick={handleClose}>
            <div className="topup-modal" onClick={(e) => e.stopPropagation()}>
                <div className="topup-modal-header">
                    <h2>
                        <i className="fas fa-coins"></i>
                        Nạp tiền vào ví
                    </h2>
                    <button className="topup-modal-close" onClick={handleClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="topup-modal-body">
                    {error && (
                        <div className="topup-modal-error">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="topup-amount-input-group">
                            <label htmlFor="amount">
                                <i className="fas fa-money-bill-wave"></i>
                                Số tiền nạp (VNĐ)
                            </label>
                            <input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value);
                                    setError('');
                                }}
                                placeholder="Nhập số tiền..."
                                min="10000"
                                step="1000"
                                disabled={loading}
                                autoFocus
                            />
                            <small>Số tiền tối thiểu: 10,000 ₫</small>
                        </div>

                        <div className="quick-amounts">
                            <label>Chọn nhanh:</label>
                            <div className="quick-amount-buttons">
                                {quickAmounts.map(quickAmount => (
                                    <button
                                        key={quickAmount}
                                        type="button"
                                        className={`quick-amount-btn ${amount === quickAmount.toString() ? 'active' : ''}`}
                                        onClick={() => handleQuickAmount(quickAmount)}
                                        disabled={loading}
                                    >
                                        {quickAmount.toLocaleString('vi-VN')} ₫
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="topup-modal-actions">
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
                                disabled={loading || !amount || parseFloat(amount) < 10000}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check"></i>
                                        Xác nhận nạp tiền
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

export default TopUpModal;

