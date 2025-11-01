// src/pages/DriverApp/Charging/ChargingLive.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveSession, getSessionStatus, stopSession } from '../../../services/chargingService';
import PaymentMethodModal from '../../../components/PaymentMethodModal';
import '../../../styles/ChargingLive.css';

export default function ChargingLive() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stopping, setStopping] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [completedSession, setCompletedSession] = useState(null);
    const pollingIntervalRef = useRef(null);

    // Load active session
    useEffect(() => {
        loadActiveSession();
    }, []);

    // Polling status mỗi 5 giây
    useEffect(() => {
        if (session?.sessionId) {
            loadStatus();
            pollingIntervalRef.current = setInterval(() => {
                loadStatus();
            }, 5000); // Update mỗi 5 giây

            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }
            };
        }
    }, [session?.sessionId]);

    const loadActiveSession = async () => {
        try {
            setLoading(true);
            setError('');
            const activeSession = await getActiveSession();
            
            if (activeSession) {
                setSession(activeSession);
            } else {
                setError('Không có phiên sạc đang hoạt động');
            }
        } catch (err) {
            console.error('Error loading active session:', err);
            setError(err.response?.data?.message || err.message || 'Không thể tải phiên sạc');
        } finally {
            setLoading(false);
        }
    };

    const loadStatus = async () => {
        if (!session?.sessionId) return;
        
        try {
            const statusData = await getSessionStatus(session.sessionId);
            setStatus(statusData);
        } catch (err) {
            console.error('Error loading status:', err);
            // Nếu session không còn tồn tại hoặc đã hoàn thành, dừng polling
            if (err.response?.status === 404 || err.response?.status === 400) {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }
                setError('Phiên sạc đã kết thúc');
                setStatus(null);
            }
        }
    };

    const handleStopSession = async () => {
        if (!session?.sessionId) return;
        
        if (!confirm('Xác nhận kết thúc phiên sạc? Bạn sẽ được yêu cầu chọn phương thức thanh toán.')) {
            return;
        }

        setStopping(true);
        try {
            const result = await stopSession(session.sessionId);
            
            // Dừng polling
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
            
            // Lưu session đã hoàn thành và hiển thị payment modal
            setCompletedSession({
                ...result,
                sessionId: result.sessionId || session.sessionId
            });
            setShowPaymentModal(true);
            
        } catch (err) {
            alert(`❌ ${err.response?.data?.message || err.message || 'Không thể kết thúc phiên sạc'}`);
        } finally {
            setStopping(false);
        }
    };

    const handlePaymentSuccess = (paymentResult) => {
        const methodName = paymentResult.paymentMethod === 'wallet' ? 'Ví điện tử' : 'Tiền mặt';
        const statusMsg = paymentResult.paymentStatus === 'pending' 
            ? '\n⚠️ Lưu ý: Thanh toán bằng tiền mặt cần nhân viên xác nhận đã thu tiền.'
            : '';
        
        alert(`✅ ${paymentResult.paymentStatus === 'pending' ? 'Yêu cầu thanh toán đã được ghi nhận!' : 'Thanh toán thành công!'}\n\n` +
              `Phương thức: ${methodName}\n` +
              `Số tiền: ${new Intl.NumberFormat('vi-VN').format(paymentResult.amount || 0)} ₫${statusMsg}`);
        
        // Đóng modal và navigate ngay lập tức
        setShowPaymentModal(false);
        setCompletedSession(null);
        // Navigate đi ngay, không kẹt ở đây
        navigate('/stations/booking');
    };

    const handlePaymentModalClose = () => {
        // Đóng modal và navigate đi ngay, không kẹt ở đây
        setShowPaymentModal(false);
        setCompletedSession(null);
        navigate('/stations/booking');
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
    };

    const formatTime = (minutes) => {
        if (!minutes && minutes !== 0) return '--';
        if (minutes < 60) return `${minutes} phút`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours} giờ ${mins} phút` : `${hours} giờ`;
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

    if (loading) {
        return (
            <div className="charging-live">
                <div className="charging-loading">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin phiên sạc...</p>
                </div>
            </div>
        );
    }

    if (error && !session) {
        return (
            <div className="charging-live">
                <div className="charging-empty">
                    <div className="empty-icon">
                        <i className="fas fa-bolt"></i>
                    </div>
                    <h2>Không có phiên sạc đang hoạt động</h2>
                    <p>{error}</p>
                    <button 
                        className="btn-back"
                        onClick={() => navigate('/stations/booking')}
                    >
                        <i className="fas fa-arrow-left"></i>
                        Quay lại đặt chỗ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="charging-live">
            <div className="charging-container">
                <div className="charging-header">
                    <div>
                        <h1>
                            <i className="fas fa-bolt"></i>
                            Phiên sạc đang diễn ra
                        </h1>
                        <p>Session ID: {session?.sessionId}</p>
                    </div>
                    <button
                        className="btn-stop-charging"
                        onClick={handleStopSession}
                        disabled={stopping || status?.status !== 'charging'}
                    >
                        {stopping ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-stop-circle"></i>
                                Kết thúc sạc
                            </>
                        )}
                    </button>
                </div>

                {/* SOC Progress */}
                {status && (
                    <div className="soc-progress-card">
                        <div className="soc-header">
                            <h2>
                                <i className="fas fa-battery-three-quarters"></i>
                                Mức pin hiện tại
                            </h2>
                            <div className="soc-percentage">
                                {status.currentSOC?.toFixed(1) || '--'}%
                            </div>
                        </div>
                        <div className="soc-progress-bar">
                            <div 
                                className="soc-progress-fill"
                                style={{ width: `${status.currentSOC || 0}%` }}
                            >
                                <span className="soc-progress-text">
                                    {status.currentSOC?.toFixed(1) || '0'}%
                                </span>
                            </div>
                        </div>
                        <div className="soc-info">
                            <span>Bắt đầu: 20%</span>
                            <span>Mục tiêu: 100%</span>
                        </div>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="charging-stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Thời gian còn lại</div>
                            <div className="stat-value">
                                {status ? formatTime(status.estimatedMinutesRemaining) : '--'}
                            </div>
                            {status?.estimatedEndTime && (
                                <div className="stat-subtitle">
                                    Dự kiến: {formatDateTime(status.estimatedEndTime)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fas fa-bolt"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Năng lượng đã sạc</div>
                            <div className="stat-value">
                                {status ? `${status.energyCharged || 0} kWh` : '--'}
                            </div>
                            {status?.estimatedTotalEnergy && (
                                <div className="stat-subtitle">
                                    Tổng dự kiến: {status.estimatedTotalEnergy} kWh
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fas fa-dollar-sign"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Chi phí hiện tại</div>
                            <div className="stat-value">
                                {status ? formatCurrency(status.currentCost) : '--'}
                            </div>
                            {status?.estimatedTotalCost && (
                                <div className="stat-subtitle">
                                    Tổng dự kiến: {formatCurrency(status.estimatedTotalCost)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fas fa-tachometer-alt"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Công suất sạc</div>
                            <div className="stat-value">
                                {status ? `${status.chargingPower || 0} kW` : '--'}
                            </div>
                            {status?.pricePerKwh && (
                                <div className="stat-subtitle">
                                    Giá: {formatCurrency(status.pricePerKwh)}/kWh
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Session Details */}
                <div className="session-details-card">
                    <h3>
                        <i className="fas fa-info-circle"></i>
                        Thông tin phiên sạc
                    </h3>
                    <div className="details-grid">
                        <div className="detail-item">
                            <span className="detail-label">Thời gian bắt đầu:</span>
                            <span className="detail-value">
                                {formatDateTime(session?.startTime)}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Thời gian đã sạc:</span>
                            <span className="detail-value">
                                {status ? formatTime(status.minutesElapsed) : '--'}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Trạm sạc:</span>
                            <span className="detail-value">ID {session?.stationId}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Cổng sạc:</span>
                            <span className="detail-value">ID {session?.chargerId}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Trạng thái:</span>
                            <span className={`detail-value status-${status?.status || session?.sessionStatus}`}>
                                {status?.status === 'charging' ? 'Đang sạc' : 
                                 status?.status === 'completed' ? 'Hoàn thành' :
                                 status?.status === 'paused' ? 'Tạm dừng' :
                                 session?.sessionStatus || '--'}
                            </span>
                        </div>
                        {status?.estimatedEndTime && (
                            <div className="detail-item">
                                <span className="detail-label">Dự kiến kết thúc:</span>
                                <span className="detail-value">
                                    {formatDateTime(status.estimatedEndTime)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Real-time Indicator */}
                {status?.status === 'charging' && (
                    <div className="charging-indicator">
                        <div className="pulse-dot"></div>
                        <span>Đang cập nhật dữ liệu real-time...</span>
                    </div>
                )}
            </div>

            {/* Payment Method Modal */}
            <PaymentMethodModal
                isOpen={showPaymentModal}
                onClose={handlePaymentModalClose}
                session={completedSession}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </div>
    );
}
