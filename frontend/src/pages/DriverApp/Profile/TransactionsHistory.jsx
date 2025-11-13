import React, { useEffect, useMemo, useState } from 'react';
import { getMyTransactionsHistory } from '../../../services/userService';
import { getMyPayments } from '../../../services/paymentService';
import { generateInvoice } from '../../../utils/invoiceGenerator';
import './TransactionsHistory.css';

export default function TransactionsHistory() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [query, setQuery] = useState({ text: '', status: 'all' });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                // Load both sessions and payments
                const [sessionsResult, paymentsResult] = await Promise.all([
                    getMyTransactionsHistory().catch(() => ({ data: [] })),
                    getMyPayments(0, 100).catch(() => ({ content: [] }))
                ]);
                
                // Combine sessions and payments into transactions list
                const sessions = Array.isArray(sessionsResult?.data) ? sessionsResult.data : [];
                const payments = Array.isArray(paymentsResult?.content) ? paymentsResult.content : 
                               Array.isArray(paymentsResult?.data) ? paymentsResult.data : 
                               Array.isArray(paymentsResult) ? paymentsResult : [];
                
                // Convert payments to transaction format
                const paymentTransactions = payments.map(payment => ({
                    sessionId: payment.sessionId,
                    sessionCode: `PAY-${payment.paymentId}`,
                    stationId: null, // Payment doesn't have stationId directly
                    chargerId: null,
                    startTime: payment.createdAt,
                    endTime: payment.paymentTime,
                    energyConsumed: null,
                    sessionStatus: payment.paymentStatus === 'completed' ? 'completed' : 
                                 payment.paymentStatus === 'pending' ? 'pending' : 'failed',
                    paymentAmount: payment.amount,
                    paymentMethod: payment.paymentMethod,
                    paymentId: payment.paymentId,
                    isPayment: true
                }));
                
                // Combine and sort by time (newest first)
                const allTransactions = [...sessions, ...paymentTransactions].sort((a, b) => {
                    const timeA = a.startTime || a.createdAt ? new Date(a.startTime || a.createdAt).getTime() : 0;
                    const timeB = b.startTime || b.createdAt ? new Date(b.startTime || b.createdAt).getTime() : 0;
                    return timeB - timeA;
                });
                
                setItems(allTransactions);
                console.log('✅ Loaded transactions:', allTransactions.length, '- Sessions:', sessions.length, '- Payments:', payments.length);
            } catch (e) {
                console.error('❌ Load transactions error:', e);
                setError(e.response?.data?.message || e.message || 'Không thể tải lịch sử giao dịch');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filtered = useMemo(() => {
        if (!items || items.length === 0) return [];
        return items.filter(x => {
            // Filter by status - handle both session status and payment status
            if (query.status !== 'all') {
                const itemStatus = x.sessionStatus?.toLowerCase() || x.paymentStatus?.toLowerCase() || '';
                if (itemStatus !== query.status.toLowerCase()) return false;
            }
            // Search filter
            if (query.text) {
                const t = query.text.toLowerCase();
                return (
                    String(x.sessionCode || x.paymentId || '').toLowerCase().includes(t) ||
                    String(x.stationId || '').includes(t) ||
                    String(x.chargerId || '').includes(t) ||
                    String(x.sessionId || '').includes(t)
                );
            }
            return true;
        });
    }, [items, query]);

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

    const getStatusLabel = (status) => {
        const labels = {
            completed: 'Hoàn thành',
            charging: 'Đang sạc',
            cancelled: 'Đã hủy',
            failed: 'Thất bại',
            pending: 'Chờ xử lý'
        };
        return labels[status] || status;
    };

    const getStatusClass = (status) => {
        return `status-badge status-${status}`;
    };

    return (
        <div className="transactions-history-container">
            <div className="transactions-header">
                <h3>Lịch sử giao dịch</h3>
                <div className="transactions-count">{filtered.length} giao dịch</div>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            <div className="filter-row">
                <input
                    type="text"
                    className="search-input"
                    placeholder="🔍 Tìm theo mã giao dịch, trạm sạc..."
                    value={query.text}
                    onChange={e => setQuery({ ...query, text: e.target.value })}
                />
                <select
                    className="status-filter"
                    value={query.status}
                    onChange={e => setQuery({ ...query, status: e.target.value })}
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="charging">Đang sạc</option>
                    <option value="cancelled">Đã hủy</option>
                    <option value="failed">Thất bại</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải lịch sử giao dịch...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p>Không có giao dịch nào</p>
                    <small>{query.text || query.status !== 'all' ? 'Thử thay đổi bộ lọc' : 'Bạn chưa có giao dịch sạc nào'}</small>
                </div>
            ) : (
                <div className="history-list">
                    {filtered.map(s => (
                        <div key={s.sessionId || s.id} className="history-item">
                            <div className="history-item-header">
                                <div className="session-code">
                                    <span className="code-label">Mã giao dịch:</span>
                                    <strong>{s.sessionCode || s.id}</strong>
                                </div>
                                <span className={getStatusClass(s.sessionStatus)}>
                                    {getStatusLabel(s.sessionStatus)}
                                </span>
                            </div>

                            <div className="history-item-body">
                                <div className="info-row">
                                    <span className="info-label">📍 Trạm sạc:</span>
                                    <span>ID {s.stationId}</span>
                                    <span className="separator">•</span>
                                    <span className="info-label">🔌 Cổng sạc:</span>
                                    <span>ID {s.chargerId}</span>
                                </div>

                                <div className="info-row">
                                    <span className="info-label">🕐 Bắt đầu:</span>
                                    <span>{formatDateTime(s.startTime)}</span>
                                </div>

                                {s.endTime && (
                                    <div className="info-row">
                                        <span className="info-label">🕐 Kết thúc:</span>
                                        <span>{formatDateTime(s.endTime)}</span>
                                    </div>
                                )}

                                {s.energyConsumed && (
                                    <div className="info-row highlight">
                                        <span className="info-label">⚡ Năng lượng:</span>
                                        <strong>{Number(s.energyConsumed).toFixed(2)} kWh</strong>
                                    </div>
                                )}
                                {s.isPayment && s.paymentAmount && (
                                    <div className="info-row highlight">
                                        <span className="info-label">💰 Thanh toán:</span>
                                        <strong>{new Intl.NumberFormat('vi-VN').format(s.paymentAmount)} ₫</strong>
                                        {s.paymentMethod && (
                                            <span className="separator">•</span>
                                        )}
                                        {s.paymentMethod && (
                                            <span className="info-label">
                                                {s.paymentMethod === 'wallet' ? 'Ví điện tử' : 
                                                 s.paymentMethod === 'cash' ? 'Tiền mặt' : 
                                                 s.paymentMethod}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="history-item-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        const details = {
                                            'Mã giao dịch': s.sessionCode || `PAY-${s.paymentId}`,
                                            'Trạm sạc': s.stationId || '-',
                                            'Cổng sạc': s.chargerId || '-',
                                            'Bắt đầu': formatDateTime(s.startTime),
                                            'Kết thúc': formatDateTime(s.endTime),
                                            'Năng lượng': s.energyConsumed ? `${s.energyConsumed} kWh` : '-',
                                            'Số tiền': s.paymentAmount ? `${new Intl.NumberFormat('vi-VN').format(s.paymentAmount)} ₫` : '-',
                                            'Phương thức': s.paymentMethod === 'wallet' ? 'Ví điện tử' : s.paymentMethod === 'cash' ? 'Tiền mặt' : s.paymentMethod || '-',
                                            'Trạng thái': getStatusLabel(s.sessionStatus)
                                        };
                                        alert(Object.entries(details).map(([k, v]) => `${k}: ${v}`).join('\n'));
                                    }}
                                >
                                    📄 Chi tiết
                                </button>
                                {(s.sessionStatus === 'completed' && s.paymentAmount) && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => generateInvoice(s)}
                                        title="Xuất hóa đơn điện tử"
                                    >
                                        📥 Xuất hóa đơn
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


