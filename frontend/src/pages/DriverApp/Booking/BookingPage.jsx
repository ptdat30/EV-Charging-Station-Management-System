// src/pages/DriverApp/Booking/BookingPage.jsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
    const loadingRef = useRef(false);

    const load = useCallback(async () => {
        if (loadingRef.current) return; // Prevent multiple simultaneous loads
        loadingRef.current = true;
        setLoading(true);
        setError('');
        try {
            const data = await getMyReservations();
            // Validate and filter out invalid reservations
            const validReservations = Array.isArray(data) 
                ? data.filter(r => r && r.reservationId) 
                : [];
            setReservations(validReservations);
            console.log('✅ Loaded reservations:', validReservations.length);
        } catch (e) {
            console.error('❌ Load reservations error:', e);
            const errorMessage = e.response?.data?.message || 
                                e.response?.data?.error || 
                                e.message || 
                                'Không thể tải danh sách đặt chỗ. Vui lòng thử lại sau.';
            setError(errorMessage);
            // Clear reservations on error to avoid showing stale data
            setReservations([]);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleUpdate = useCallback(() => {
        // Debounce to prevent rapid successive calls
        if (loadingRef.current) return;
        // Use setTimeout to delay the load, allowing any ongoing renders to complete
        setTimeout(() => {
            load(); // Reload after action
        }, 50);
    }, [load]);

    const handleError = useCallback((errorMsg) => {
        setError(errorMsg);
    }, []);

    const filteredReservations = useMemo(() => {
        // First, filter out cancelled reservations and invalid ones
        let filtered = reservations.filter(r => {
            if (!r || !r.reservationId) return false;
            if (r.status === 'cancelled') return false; // Hide cancelled reservations
            
            // IMPORTANT: Filter out reservations that are actually completed but not paid
            // These should not appear as "active" - they should be "completed" status
            // If status is "active" but session is completed and not paid, it's a data inconsistency
            // We'll treat it as completed to avoid payment modal issues
            if (r.status === 'active' && r.sessionId) {
                // Active reservation with session - this is valid
                return true;
            }
            
            return true;
        });

        // Apply status filter if not 'all'
        if (filter !== 'all') {
            filtered = filtered.filter(r => {
                // Strict status matching
                if (r.status !== filter) return false;
                
                // Additional validation for "active" filter
                if (filter === 'active') {
                    // Active reservations MUST have a sessionId (session is running)
                    // If status is "active" but no sessionId, it might be a data issue
                    // Only show if it has sessionId to avoid confusion and payment modal issues
                    if (!r.sessionId) {
                        console.warn('⚠️ Reservation with "active" status but no sessionId found:', r.reservationId);
                        return false; // Hide invalid active reservations
                    }
                    return true;
                }
                
                return true;
            });
        }

        // Sort by priority: confirmed > active > pending > completed > expired > no_show
        // Within same status, sort by reservedStartTime (newest first)
        const statusPriority = {
            'confirmed': 1,  // Đã xác nhận lên đầu để người dùng dễ thấy
            'active': 2,
            'pending': 3,
            'completed': 4,
            'expired': 5,
            'no_show': 6
        };

        filtered.sort((a, b) => {
            // First, sort by status priority
            const priorityA = statusPriority[a.status] || 99;
            const priorityB = statusPriority[b.status] || 99;
            
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            
            // If same status, sort by reservedStartTime (newest first)
            const timeA = a.reservedStartTime ? new Date(a.reservedStartTime).getTime() : 0;
            const timeB = b.reservedStartTime ? new Date(b.reservedStartTime).getTime() : 0;
            return timeB - timeA; // Descending order (newest first)
        });

        return filtered;
    }, [reservations, filter]);

    const statusCounts = useMemo(() => {
        // Filter out cancelled reservations from counts
        const validReservations = reservations.filter(r => 
            r && r.reservationId && r.status !== 'cancelled'
        );
        
        const counts = {
            all: validReservations.length,
            confirmed: 0,
            active: 0,
            completed: 0,
            cancelled: 0, // Keep for filter button but will always be 0
            no_show: 0,
            pending: 0,
            expired: 0
        };
        
        validReservations.forEach(r => {
            if (r && r.status && typeof r.status === 'string') {
                // For "active" status, only count if it has sessionId (actually active session)
                if (r.status === 'active') {
                    if (r.sessionId != null) {
                        counts.active++;
                    }
                    // If status is "active" but no sessionId, don't count it as active
                    // This prevents data inconsistency issues
                } else if (counts.hasOwnProperty(r.status)) {
                    counts[r.status]++;
                }
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
                    {['all', 'confirmed', 'active', 'completed', 'no_show'].map(status => (
                        <button
                            key={status}
                            className={`filter-btn ${filter === status ? 'active' : ''}`}
                            onClick={() => {
                                // Prevent rapid clicks that might cause issues
                                if (loading) return;
                                setFilter(status);
                            }}
                            disabled={loading}
                        >
                            {getStatusLabel(status)}
                            {statusCounts[status] !== undefined && statusCounts[status] > 0 && (
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
                        {filteredReservations.map(reservation => {
                            // Additional safety check
                            if (!reservation || !reservation.reservationId) {
                                return null;
                            }
                            return (
                                <ReservationCard
                                    key={reservation.reservationId}
                                    reservation={reservation}
                                    onUpdate={handleUpdate}
                                    onError={handleError}
                                />
                            );
                        })}
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
