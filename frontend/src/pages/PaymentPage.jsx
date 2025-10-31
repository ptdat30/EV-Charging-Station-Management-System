// src/pages/PaymentPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBalance, topUpWallet } from '../services/walletService';
import { getMyPayments } from '../services/paymentService';
import TopUpModal from '../components/TopUpModal';
import '../styles/PaymentPage.css';

const PaymentPage = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [topUpModalOpen, setTopUpModalOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // all, completed, pending, failed, refunded

    const loadBalance = async () => {
        try {
            const data = await getBalance();
            setBalance(data.balance || 0);
        } catch (err) {
            console.error('Error loading balance:', err);
            setError(err.response?.data?.message || 'Không thể tải số dư ví');
        }
    };

    const loadPayments = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getMyPayments(0, 50);
            // Handle different response formats
            const paymentList = data.content || data.data || data || [];
            setPayments(Array.isArray(paymentList) ? paymentList : []);
        } catch (err) {
            console.error('Error loading payments:', err);
            setError(err.response?.data?.message || 'Không thể tải lịch sử thanh toán');
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBalance();
        loadPayments();
    }, []);

    const handleTopUpSuccess = () => {
        loadBalance();
        loadPayments();
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            completed: 'Thành công',
            failed: 'Thất bại',
            refunded: 'Đã hoàn tiền',
            cancelled: 'Đã hủy'
        };
        return labels[status] || status;
    };

    const getStatusClass = (status) => {
        const classes = {
            pending: 'status-pending',
            processing: 'status-processing',
            completed: 'status-completed',
            failed: 'status-failed',
            refunded: 'status-refunded',
            cancelled: 'status-cancelled'
        };
        return classes[status] || 'status-default';
    };

    const getPaymentMethodLabel = (method) => {
        const labels = {
            wallet: 'Ví điện tử',
            e_wallet: 'Ví điện tử',
            banking: 'Chuyển khoản',
            credit_card: 'Thẻ tín dụng',
            debit_card: 'Thẻ ghi nợ',
            cash: 'Tiền mặt',
            qr_payment: 'QR Code'
        };
        return labels[method] || method;
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return '-';
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateTimeStr;
        }
    };

    const filteredPayments = payments.filter(p => {
        if (filter === 'all') return true;
        return p.paymentStatus === filter;
    });

    const paymentStats = {
        total: payments.length,
        completed: payments.filter(p => p.paymentStatus === 'completed').length,
        pending: payments.filter(p => p.paymentStatus === 'pending' || p.paymentStatus === 'processing').length,
        totalAmount: payments
            .filter(p => p.paymentStatus === 'completed')
            .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
    };

    return (
        <div className="payment-page">
            <div className="payment-page-container">
                {/* Header */}
                <div className="payment-page-header">
                    <div>
                        <h1>
                            <i className="fas fa-wallet"></i>
                            Ví điện tử
                        </h1>
                        <p>Quản lý số dư và lịch sử thanh toán</p>
                    </div>
                </div>

                {error && (
                    <div className="payment-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                {/* Balance Card */}
                <div className="payment-balance-card">
                    <div className="balance-content">
                        <div className="balance-label">Số dư hiện tại</div>
                        <div className="balance-amount">
                            {balance.toLocaleString('vi-VN')} <span className="currency">₫</span>
                        </div>
                    </div>
                    <div className="balance-actions">
                        <button
                            className="btn-topup"
                            onClick={() => setTopUpModalOpen(true)}
                        >
                            <i className="fas fa-plus-circle"></i>
                            Nạp tiền
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="payment-stats">
                    <div className="stat-card">
                        <div className="stat-icon completed">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{paymentStats.completed}</div>
                            <div className="stat-label">Giao dịch thành công</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon pending">
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{paymentStats.pending}</div>
                            <div className="stat-label">Đang xử lý</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon total">
                            <i className="fas fa-money-bill-wave"></i>
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">
                                {paymentStats.totalAmount.toLocaleString('vi-VN')} ₫
                            </div>
                            <div className="stat-label">Tổng đã thanh toán</div>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="payment-history-section">
                    <div className="payment-history-header">
                        <h2>
                            <i className="fas fa-history"></i>
                            Lịch sử thanh toán
                        </h2>
                        <div className="payment-filters">
                            {['all', 'completed', 'pending', 'processing', 'failed', 'refunded'].map(status => (
                                <button
                                    key={status}
                                    className={`filter-btn ${filter === status ? 'active' : ''}`}
                                    onClick={() => setFilter(status)}
                                >
                                    {getStatusLabel(status)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="payment-loading">
                            <div className="spinner"></div>
                            <p>Đang tải lịch sử thanh toán...</p>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="payment-empty">
                            <i className="fas fa-receipt"></i>
                            <h3>Chưa có giao dịch nào</h3>
                            <p>
                                {filter === 'all'
                                    ? 'Bạn chưa có giao dịch thanh toán nào. Hãy sử dụng dịch vụ để tạo giao dịch đầu tiên!'
                                    : `Không có giao dịch với trạng thái "${getStatusLabel(filter)}"`}
                            </p>
                        </div>
                    ) : (
                        <div className="payments-list">
                            {filteredPayments.map((payment) => (
                                <div key={payment.paymentId || payment.id} className={`payment-item ${getStatusClass(payment.paymentStatus)}`}>
                                    <div className="payment-item-header">
                                        <div className="payment-id">
                                            <i className="fas fa-receipt"></i>
                                            <span>
                                                Mã: {payment.paymentId || payment.id || 'N/A'}
                                            </span>
                                        </div>
                                        <span className={`payment-status ${getStatusClass(payment.paymentStatus)}`}>
                                            {getStatusLabel(payment.paymentStatus)}
                                        </span>
                                    </div>
                                    <div className="payment-item-body">
                                        <div className="payment-info-row">
                                            <span className="info-icon">💰</span>
                                            <span className="info-label">Số tiền:</span>
                                            <span className="payment-amount">
                                                {new Intl.NumberFormat('vi-VN').format(payment.amount || 0)} ₫
                                            </span>
                                        </div>
                                        <div className="payment-info-row">
                                            <span className="info-icon">💳</span>
                                            <span className="info-label">Phương thức:</span>
                                            <span>{getPaymentMethodLabel(payment.paymentMethod)}</span>
                                        </div>
                                        {payment.sessionId && (
                                            <div className="payment-info-row">
                                                <span className="info-icon">🔌</span>
                                                <span className="info-label">Phiên sạc:</span>
                                                <span>ID {payment.sessionId}</span>
                                            </div>
                                        )}
                                        {payment.paymentTime && (
                                            <div className="payment-info-row">
                                                <span className="info-icon">🕐</span>
                                                <span className="info-label">Thời gian:</span>
                                                <span>{formatDateTime(payment.paymentTime)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Up Modal */}
                <TopUpModal
                    isOpen={topUpModalOpen}
                    onClose={() => setTopUpModalOpen(false)}
                    onSuccess={handleTopUpSuccess}
                />
            </div>
        </div>
    );
};

export default PaymentPage;

