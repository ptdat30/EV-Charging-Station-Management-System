// src/components/PaymentMethodModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBalance } from '../services/walletService';
import apiClient from '../config/api';
import '../styles/PaymentMethodModal.css';

const PaymentMethodModal = ({ isOpen, onClose, session, onPaymentSuccess }) => {
    const { user } = useAuth();
    const [selectedMethod, setSelectedMethod] = useState('wallet');
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            loadWalletBalance();
        }
    }, [isOpen, user]);

    const loadWalletBalance = async () => {
        try {
            const data = await getBalance();
            setWalletBalance(data.balance || 0);
        } catch (err) {
            console.error('Error loading wallet balance:', err);
        }
    };

    const calculateTotal = () => {
        if (!session || !session.energyConsumed) return 0;
        const energy = parseFloat(session.energyConsumed) || 0;
        const pricePerKwh = 3000; // Giá cố định
        return energy * pricePerKwh;
    };

    const totalAmount = calculateTotal();
    const hasInsufficientBalance = selectedMethod === 'wallet' && walletBalance < totalAmount;

    const handleConfirmPayment = async () => {
        if (!session) {
            setError('Không có thông tin phiên sạc');
            return;
        }

        if (selectedMethod === 'wallet' && hasInsufficientBalance) {
            setError('Số dư ví không đủ. Vui lòng nạp thêm tiền hoặc chọn thanh toán bằng tiền mặt.');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            // Gọi API để xử lý thanh toán
            const response = await apiClient.post('/payments/process', {
                sessionId: session.sessionId,
                userId: user?.userId || user?.id,
                energyConsumed: session.energyConsumed,
                pricePerKwh: 3000,
                paymentMethod: selectedMethod
            });

            if (response.data) {
                // Success - gọi callback và đóng modal
                // Modal sẽ tự đóng và navigate được xử lý ở parent component
                if (onPaymentSuccess) {
                    onPaymentSuccess(response.data);
                }
                // Không cần gọi onClose ở đây vì parent sẽ xử lý navigate
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.response?.data?.message || err.message || 'Thanh toán thất bại. Vui lòng thử lại.');
        } finally {
            setProcessing(false);
        }
    };

    if (!isOpen) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
    };

    return (
        <div className="payment-method-modal-overlay" onClick={onClose}>
            <div className="payment-method-modal" onClick={(e) => e.stopPropagation()}>
                <div className="payment-method-modal-header">
                    <h2>
                        <i className="fas fa-credit-card"></i>
                        Chọn phương thức thanh toán
                    </h2>
                    <button className="payment-method-modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="payment-method-modal-body">
                    {error && (
                        <div className="payment-method-error">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    {/* Session Summary */}
                    <div className="payment-session-summary">
                        <h3>Thông tin phiên sạc</h3>
                        <div className="summary-item">
                            <span>Năng lượng đã sạc:</span>
                            <strong>{session?.energyConsumed || 0} kWh</strong>
                        </div>
                        <div className="summary-item">
                            <span>Đơn giá:</span>
                            <strong>3.000 ₫/kWh</strong>
                        </div>
                        <div className="summary-item total">
                            <span>Tổng thanh toán:</span>
                            <strong className="total-amount">{formatCurrency(totalAmount)}</strong>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="payment-methods">
                        <h3>Phương thức thanh toán</h3>
                        
                        {/* Wallet Option */}
                        <div 
                            className={`payment-method-option ${selectedMethod === 'wallet' ? 'selected' : ''}`}
                            onClick={() => setSelectedMethod('wallet')}
                        >
                            <div className="method-radio">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="wallet"
                                    checked={selectedMethod === 'wallet'}
                                    onChange={() => setSelectedMethod('wallet')}
                                />
                            </div>
                            <div className="method-content">
                                <div className="method-header">
                                    <i className="fas fa-wallet"></i>
                                    <span className="method-name">Ví điện tử</span>
                                </div>
                                <div className="method-details">
                                    <span className="wallet-balance">
                                        Số dư: {formatCurrency(walletBalance)}
                                    </span>
                                    {hasInsufficientBalance && (
                                        <span className="insufficient-balance">
                                            ⚠️ Không đủ số dư
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cash Option */}
                        <div 
                            className={`payment-method-option ${selectedMethod === 'cash' ? 'selected' : ''}`}
                            onClick={() => setSelectedMethod('cash')}
                        >
                            <div className="method-radio">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="cash"
                                    checked={selectedMethod === 'cash'}
                                    onChange={() => setSelectedMethod('cash')}
                                />
                            </div>
                            <div className="method-content">
                                <div className="method-header">
                                    <i className="fas fa-money-bill-wave"></i>
                                    <span className="method-name">Tiền mặt</span>
                                </div>
                                <div className="method-details">
                                    <span>Thanh toán trực tiếp tại trạm</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="payment-method-modal-footer">
                    <button
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Hủy
                    </button>
                    <button
                        className="btn-confirm-payment"
                        onClick={handleConfirmPayment}
                        disabled={processing || hasInsufficientBalance}
                    >
                        {processing ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-check"></i>
                                Xác nhận thanh toán
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodModal;

