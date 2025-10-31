// src/pages/DriverApp/Booking/BookingPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { getMyReservations } from '../../../services/stationService';
import ReservationCard from '../../../components/ReservationCard';
import QRCodeInputModal from '../../../components/QRCodeInputModal';
import '../../../styles/BookingPage.css';

export default function BookingPage() {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all, confirmed, active, completed, cancelled, no_show
    const [qrModalOpen, setQrModalOpen] = useState(false);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getMyReservations();
            setReservations(Array.isArray(data) ? data : []);
            console.log('✅ Loaded reservations:', data.length);
        } catch (e) {
            console.error('❌ Load reservations error:', e);
            setError(e.response?.data?.message || e.message || 'Không thể tải danh sách đặt chỗ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleUpdate = () => {
        load(); // Reload after action
    };

    const handleError = (errorMsg) => {
        setError(errorMsg);
    };

    const filteredReservations = useMemo(() => {
        if (filter === 'all') return reservations;
        return reservations.filter(r => r.status === filter);
    }, [reservations, filter]);

    const statusCounts = useMemo(() => {
        const counts = {
            all: reservations.length,
            confirmed: 0,
            active: 0,
            completed: 0,
            cancelled: 0,
            no_show: 0
        };
        reservations.forEach(r => {
            if (r.status && counts.hasOwnProperty(r.status)) {
                counts[r.status]++;
            }
        });
        return counts;
    }, [reservations]);

    const getStatusLabel = (status) => {
        const labels = {
            all: 'Tất cả',
            pending: 'Chờ thanh toán',
            confirmed: 'Đã xác nhận',
            active: 'Đang hoạt động',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy',
            expired: 'Hết hạn',
            no_show: 'Không đến'
        };
        return labels[status] || status;
    };

    return (
        <div className="booking-page">
            <div className="booking-page-container">
                <div className="booking-page-header">
                    <div>
                        <h1>
                            <i className="fas fa-calendar-check"></i>
                            Đặt chỗ của tôi
                        </h1>
                        <p>Quản lý các đặt chỗ sạc xe điện của bạn</p>
                    </div>
                    <div className="booking-header-actions">
                        <button
                            className="btn-qr-dev"
                            onClick={() => setQrModalOpen(true)}
                            title="Nhập QR Code (Dev Mode)"
                        >
                            <i className="fas fa-qrcode"></i>
                            Quét QR (Dev)
                        </button>
                    </div>
                    <div className="booking-stats">
                        <div className="stat-item">
                            <div className="stat-value">{statusCounts.all}</div>
                            <div className="stat-label">Tổng số</div>
                        </div>
                        <div className="stat-item confirmed">
                            <div className="stat-value">{statusCounts.confirmed}</div>
                            <div className="stat-label">Đã xác nhận</div>
                        </div>
                        <div className="stat-item active">
                            <div className="stat-value">{statusCounts.active}</div>
                            <div className="stat-label">Đang hoạt động</div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="booking-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                <div className="booking-filters">
                    {['all', 'confirmed', 'active', 'completed', 'cancelled', 'no_show'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {getStatusLabel(status)}
                            {statusCounts[status] > 0 && (
                                <span className="filter-count">{statusCounts[status]}</span>
                            )}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="booking-loading">
                        <div className="spinner"></div>
                        <p>Đang tải danh sách đặt chỗ...</p>
                    </div>
                ) : filteredReservations.length === 0 ? (
                    <div className="booking-empty">
                        <div className="empty-icon">
                            <i className="fas fa-calendar-times"></i>
                        </div>
                        <h3>Chưa có đặt chỗ nào</h3>
                        <p>
                            {filter === 'all' 
                                ? 'Bạn chưa có đặt chỗ nào. Hãy tìm trạm sạc và đặt chỗ ngay!'
                                : `Không có đặt chỗ với trạng thái "${getStatusLabel(filter)}"`}
                        </p>
                        {filter !== 'all' && (
                            <button className="btn-view-all" onClick={() => setFilter('all')}>
                                Xem tất cả đặt chỗ
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="reservations-list">
                        {filteredReservations.map(reservation => (
                            <ReservationCard
                                key={reservation.reservationId}
                                reservation={reservation}
                                onUpdate={handleUpdate}
                                onError={handleError}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            {/* QR Code Input Modal */}
            <QRCodeInputModal
                isOpen={qrModalOpen}
                onClose={() => setQrModalOpen(false)}
                onSuccess={(session) => {
                    console.log('Session started:', session);
                    load(); // Reload reservations
                }}
            />
        </div>
    );
}
