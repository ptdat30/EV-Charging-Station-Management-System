// src/pages/DriverApp/Charging/ChargingLive.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveSession, getSessionStatus, stopSession, getSessionById } from '../../../services/chargingService';
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
    const [speedMultiplier, setSpeedMultiplier] = useState(1); // x1, x2, x4, x8
    const pollingIntervalRef = useRef(null);

    // Load active session and restore pending payment from localStorage
    useEffect(() => {
        // Kiểm tra xem có pending payment session không
        const pendingSession = localStorage.getItem('pendingPaymentSession');
        if (pendingSession) {
            try {
                const sessionData = JSON.parse(pendingSession);
                console.log('🔄 Restored pending payment session from localStorage:', sessionData);
                setCompletedSession(sessionData);
                setSession(sessionData); // Set session để hiển thị info
                setShowPaymentModal(true); // Tự động hiện modal thanh toán
                setLoading(false);
            } catch (err) {
                console.error('Error parsing pending session:', err);
                localStorage.removeItem('pendingPaymentSession');
                loadActiveSession();
            }
        } else {
            loadActiveSession();
        }
    }, []);

    // Polling status với tốc độ có thể điều chỉnh
    useEffect(() => {
        if (session?.sessionId) {
            // Load ngay khi mount hoặc speed thay đổi
            const fetchStatus = async () => {
                try {
                    console.log(`⚡ Fetching status with speed multiplier: x${speedMultiplier}`);
                    const statusData = await getSessionStatus(session.sessionId, speedMultiplier);
                    console.log(`📊 Current SOC: ${statusData.currentSOC}%, Status: ${statusData.status}`);
                    
                    // [FIX]: Detect khi session bị staff stop
                    if (statusData.status === 'completed' && session.sessionStatus !== 'completed') {
                        console.log('🛑 Session stopped by staff! Triggering payment modal...');
                        
                        // Stop polling
                        if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current);
                        }
                        
                        // Reload session để có data mới nhất
                        const updatedSession = await getSessionById(session.sessionId);
                        
                        // Prepare completed session data với energyCharged từ status
                        const completedData = {
                            ...updatedSession,
                            energyConsumed: statusData.energyCharged || updatedSession.energyConsumed,
                            pricePerKwh: statusData.pricePerKwh
                        };
                        
                        // Lưu vào localStorage để persist
                        localStorage.setItem('pendingPaymentSession', JSON.stringify(completedData));
                        
                        // Update state và show payment modal
                        setSession(completedData);
                        setCompletedSession(completedData);
                        setShowPaymentModal(true);
                        
                        return; // Don't update status anymore
                    }
                    
                    setStatus(statusData);
                } catch (err) {
                    console.error('Error loading status:', err);
                }
            };
            
            fetchStatus(); // Load ngay lập tức
            
            // Giảm interval khi tăng speed
            let interval;
            if (speedMultiplier >= 100) {
                interval = 1000; // x100: update mỗi 1s thôi, không cần spam
            } else {
                interval = Math.max(500, 5000 / speedMultiplier);
            }
            
            pollingIntervalRef.current = setInterval(fetchStatus, interval);

            return () => {
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                }
            };
        }
    }, [session?.sessionId, speedMultiplier]); // Thêm speedMultiplier vào dependency

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

    const handleStopSession = async () => {
        if (!session?.sessionId) return;
        
        if (!confirm('Xác nhận kết thúc phiên sạc? Bạn sẽ được yêu cầu chọn phương thức thanh toán.')) {
            return;
        }

        setStopping(true);
        try {
            // Lấy status hiện tại trước khi stop để gửi energyCharged thực tế
            const currentStatus = await getSessionStatus(session.sessionId, speedMultiplier);
            console.log('🛑 Stopping session with energy:', currentStatus.energyCharged, 'kWh, SOC:', currentStatus.currentSOC, '%');
            
            // Gửi energyCharged và currentSOC từ status thực tế
            const stopData = {
                energyCharged: currentStatus.energyCharged,
                currentSOC: currentStatus.currentSOC
            };
            
            const result = await stopSession(session.sessionId, stopData);
            
            // Dừng polling
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
            
            // Lưu session đã hoàn thành vào localStorage để persist sau khi F5
            const completedData = {
                ...result,
                sessionId: result.sessionId || session.sessionId,
                energyConsumed: result.energyConsumed || currentStatus.energyCharged,
                pricePerKwh: currentStatus.pricePerKwh // Lưu giá để tính toán đúng khi restore
            };
            localStorage.setItem('pendingPaymentSession', JSON.stringify(completedData));
            
            // Hiển thị payment modal
            setCompletedSession(completedData);
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
        
        // Clear localStorage khi thanh toán thành công
        localStorage.removeItem('pendingPaymentSession');
        
        // Đóng modal và navigate ngay lập tức
        setShowPaymentModal(false);
        setCompletedSession(null);
        // Navigate đi ngay, không kẹt ở đây
        navigate('/stations/booking');
    };

    const handlePaymentModalClose = () => {
        // Đóng modal NHƯNG KHÔNG navigate, giữ session để user có thể quay lại thanh toán
        setShowPaymentModal(false);
        // KHÔNG setCompletedSession(null) - giữ session
        // KHÔNG navigate - ở lại trang này để hiển thị trạng thái "Chờ thanh toán"
        
        // Reload session để hiện trạng thái mới
        loadActiveSession();
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

    // Kiểm tra xem session đã completed chưa thanh toán
    const isCompletedUnpaid = session?.sessionStatus === 'completed' && !session?.isPaid;

    return (
        <div className="charging-live">
            <div className="charging-container">
                <div className="charging-header">
                    <div>
                        <h1>
                            <i className="fas fa-bolt"></i>
                            {isCompletedUnpaid ? 'Phiên sạc đã hoàn thành' : 'Phiên sạc đang diễn ra'}
                        </h1>
                        <p>Session ID: {session?.sessionId}</p>
                        {isCompletedUnpaid && (
                            <p style={{ color: '#ff9800', fontWeight: 600, marginTop: '8px' }}>
                                <i className="fas fa-exclamation-triangle"></i>
                                Chưa thanh toán - Vui lòng hoàn tất thanh toán
                            </p>
                        )}
                    </div>
                    
                    {isCompletedUnpaid ? (
                        <button
                            className="btn-payment"
                            onClick={() => {
                                setCompletedSession(session);
                                setShowPaymentModal(true);
                            }}
                        >
                            <i className="fas fa-credit-card"></i>
                            Thanh toán ngay
                        </button>
                    ) : (
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
                    )}
                </div>

                {/* Speed Control (for testing/demo) - Chỉ hiện khi đang sạc */}
                {!isCompletedUnpaid && status?.status === 'charging' && (
                    <div className="speed-control">
                        <span className="speed-label">
                            <i className="fas fa-tachometer-alt"></i>
                            Tốc độ demo:
                        </span>
                        <div className="speed-buttons">
                            {[1, 2, 4, 8].map(speed => (
                                <button
                                    key={speed}
                                    className={`speed-btn ${speedMultiplier === speed ? 'active' : ''}`}
                                    onClick={() => setSpeedMultiplier(speed)}
                                >
                                    x{speed}
                                </button>
                            ))}
                            <button
                                className="speed-btn instant-btn"
                                onClick={() => setSpeedMultiplier(100)}
                                title="Sạc đầy ngay lập tức"
                            >
                                <i className="fas fa-forward"></i>
                                100%
                            </button>
                        </div>
                        <span className="speed-info">
                            {speedMultiplier === 100 ? 'Sạc đầy ngay!' : `Update mỗi ${(5000 / speedMultiplier / 1000).toFixed(1)}s`}
                        </span>
                    </div>
                )}

                {/* Summary Card for Completed Unpaid Session */}
                {isCompletedUnpaid && (
                    <div className="payment-summary-card">
                        <h3>
                            <i className="fas fa-receipt"></i>
                            Tóm tắt phiên sạc
                        </h3>
                        <div className="summary-details">
                            <div className="summary-item">
                                <span>Năng lượng đã sạc:</span>
                                <strong>{session.energyConsumed || 0} kWh</strong>
                            </div>
                            <div className="summary-item">
                                <span>Thời gian sạc:</span>
                                <strong>{formatTime(status?.minutesElapsed || 0)}</strong>
                            </div>
                            <div className="summary-item total">
                                <span>Tổng chi phí:</span>
                                <strong className="total-cost">{formatCurrency(status?.currentCost || 0)}</strong>
                            </div>
                        </div>
                    </div>
                )}

                {/* SOC Progress */}
                {status && !isCompletedUnpaid && (
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
