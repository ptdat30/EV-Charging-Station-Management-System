// src/components/admin/IncidentManagement.jsx
import React, { useState, useEffect } from 'react';
import {
    getAllIncidents,
    getActiveIncidents,
    getIncidentById,
    getIncidentStatistics,
    assignIncident,
    updateIncidentPriority,
    resolveIncident,
    getIncidentHistory
} from '../../services/incidentService';
import { getAllStations } from '../../services/stationService';
import '../../styles/AdminIncidentManagement.css';

const IncidentManagement = () => {
    const [incidents, setIncidents] = useState([]);
    const [filteredIncidents, setFilteredIncidents] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modals
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showPriorityModal, setShowPriorityModal] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [incidentHistory, setIncidentHistory] = useState([]);
    const [stations, setStations] = useState([]);
    
    // Filters
    const [viewMode, setViewMode] = useState('all'); // all, active, pending, in_progress, resolved
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [stationFilter, setStationFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Form states
    const [assignForm, setAssignForm] = useState({ assignedTo: '', notes: '' });
    const [priorityForm, setPriorityForm] = useState({ priority: 'medium', notes: '' });
    const [resolveForm, setResolveForm] = useState({ resolutionNotes: '', resolutionRating: 5 });

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        applyFilters();
    }, [incidents, viewMode, priorityFilter, typeFilter, severityFilter, stationFilter, searchQuery]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [incidentsData, statsData, stationsData] = await Promise.all([
                viewMode === 'active' ? getActiveIncidents() : getAllIncidents(),
                getIncidentStatistics(),
                getAllStations()
            ]);
            
            setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
            setStatistics(statsData);
            setStations(Array.isArray(stationsData) ? stationsData : []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Không thể tải dữ liệu sự cố');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...incidents];

        // View mode filter
        if (viewMode === 'active') {
            filtered = filtered.filter(i => i.status === 'pending' || i.status === 'in_progress');
        } else if (viewMode !== 'all') {
            filtered = filtered.filter(i => i.status === viewMode);
        }

        // Priority filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(i => i.priority === priorityFilter);
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(i => i.incidentType === typeFilter);
        }

        // Severity filter
        if (severityFilter !== 'all') {
            filtered = filtered.filter(i => i.severity === severityFilter);
        }

        // Station filter
        if (stationFilter !== 'all') {
            filtered = filtered.filter(i => i.stationId === parseInt(stationFilter));
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(i =>
                i.description?.toLowerCase().includes(query) ||
                i.stationName?.toLowerCase().includes(query) ||
                i.reportedBy?.toLowerCase().includes(query) ||
                i.incidentId?.toString().includes(query)
            );
        }

        // Sort by priority and created date
        filtered.sort((a, b) => {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setFilteredIncidents(filtered);
    };

    const handleViewDetail = async (incident) => {
        try {
            const fullIncident = await getIncidentById(incident.incidentId);
            setSelectedIncident(fullIncident);
            setShowDetailModal(true);
        } catch (err) {
            console.error('Error fetching incident details:', err);
            alert('Không thể tải chi tiết sự cố');
        }
    };

    const handleViewHistory = async (incident) => {
        try {
            const history = await getIncidentHistory(incident.incidentId);
            setIncidentHistory(history);
            setSelectedIncident(incident);
            setShowHistoryModal(true);
        } catch (err) {
            console.error('Error fetching incident history:', err);
            alert('Không thể tải lịch sử sự cố');
        }
    };

    const handleAssign = async () => {
        if (!assignForm.assignedTo) {
            alert('Vui lòng nhập ID nhân viên được phân công');
            return;
        }

        try {
            await assignIncident(selectedIncident.incidentId, parseInt(assignForm.assignedTo), assignForm.notes);
            alert('Phân công thành công!');
            setShowAssignModal(false);
            setAssignForm({ assignedTo: '', notes: '' });
            fetchData();
        } catch (err) {
            console.error('Error assigning incident:', err);
            alert(err.response?.data?.message || 'Không thể phân công sự cố');
        }
    };

    const handleUpdatePriority = async () => {
        try {
            await updateIncidentPriority(selectedIncident.incidentId, priorityForm.priority, priorityForm.notes);
            alert('Cập nhật ưu tiên thành công!');
            setShowPriorityModal(false);
            setPriorityForm({ priority: 'medium', notes: '' });
            fetchData();
        } catch (err) {
            console.error('Error updating priority:', err);
            alert(err.response?.data?.message || 'Không thể cập nhật ưu tiên');
        }
    };

    const handleResolve = async () => {
        if (!resolveForm.resolutionNotes) {
            alert('Vui lòng nhập ghi chú xử lý');
            return;
        }

        try {
            await resolveIncident(
                selectedIncident.incidentId,
                resolveForm.resolutionNotes,
                resolveForm.resolutionRating
            );
            alert('Xử lý sự cố thành công!');
            setShowResolveModal(false);
            setResolveForm({ resolutionNotes: '', resolutionRating: 5 });
            fetchData();
        } catch (err) {
            console.error('Error resolving incident:', err);
            alert(err.response?.data?.message || 'Không thể xử lý sự cố');
        }
    };

    const getPriorityBadgeClass = (priority) => {
        const classes = {
            urgent: 'priority-urgent',
            high: 'priority-high',
            medium: 'priority-medium',
            low: 'priority-low'
        };
        return classes[priority] || 'priority-medium';
    };

    const getSeverityBadgeClass = (severity) => {
        const classes = {
            critical: 'severity-critical',
            high: 'severity-high',
            medium: 'severity-medium',
            low: 'severity-low'
        };
        return classes[severity] || 'severity-medium';
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            pending: 'status-pending',
            in_progress: 'status-in-progress',
            resolved: 'status-resolved',
            closed: 'status-closed',
            cancelled: 'status-cancelled'
        };
        return classes[status] || 'status-pending';
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Chờ xử lý',
            in_progress: 'Đang xử lý',
            resolved: 'Đã xử lý',
            closed: 'Đã đóng',
            cancelled: 'Đã hủy'
        };
        return labels[status] || status;
    };

    const getTypeLabel = (type) => {
        const labels = {
            equipment: 'Thiết bị',
            power: 'Điện năng',
            network: 'Mạng',
            other: 'Khác'
        };
        return labels[type] || type;
    };

    if (loading && !incidents.length) {
        return (
            <div className="incident-management">
                <div className="loading-spinner">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="incident-management">
            <div className="incident-header">
                <h1>Quản lý sự cố hệ thống</h1>
                <button className="btn-refresh" onClick={fetchData}>
                    <i className="fas fa-sync-alt"></i> Làm mới
                </button>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="incident-statistics">
                    <div className="stat-card">
                        <div className="stat-icon urgent">
                            <i className="fas fa-exclamation-circle"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.urgentIncidentsCount || 0}</div>
                            <div className="stat-label">Sự cố khẩn cấp</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon critical">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.criticalSeverityCount || 0}</div>
                            <div className="stat-label">Mức độ nghiêm trọng</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon active">
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.pendingIncidents + statistics.inProgressIncidents || 0}</div>
                            <div className="stat-label">Đang xử lý</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon resolved">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{statistics.resolvedIncidents || 0}</div>
                            <div className="stat-label">Đã xử lý</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="incident-filters">
                <div className="filter-group">
                    <label>Chế độ xem:</label>
                    <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="active">Đang xử lý</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="in_progress">Đang xử lý</option>
                        <option value="resolved">Đã xử lý</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Ưu tiên:</label>
                    <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="urgent">Khẩn cấp</option>
                        <option value="high">Cao</option>
                        <option value="medium">Trung bình</option>
                        <option value="low">Thấp</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Loại:</label>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="equipment">Thiết bị</option>
                        <option value="power">Điện năng</option>
                        <option value="network">Mạng</option>
                        <option value="other">Khác</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Mức độ:</label>
                    <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="critical">Nghiêm trọng</option>
                        <option value="high">Cao</option>
                        <option value="medium">Trung bình</option>
                        <option value="low">Thấp</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Trạm:</label>
                    <select value={stationFilter} onChange={(e) => setStationFilter(e.target.value)}>
                        <option value="all">Tất cả</option>
                        {stations.map(station => (
                            <option key={station.stationId} value={station.stationId}>
                                {station.stationName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group search">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Incidents Table */}
            <div className="incidents-table-container">
                <table className="incidents-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Trạm</th>
                            <th>Loại</th>
                            <th>Mức độ</th>
                            <th>Ưu tiên</th>
                            <th>Trạng thái</th>
                            <th>Người báo cáo</th>
                            <th>Người được phân công</th>
                            <th>Thời gian tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredIncidents.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="no-data">Không có sự cố nào</td>
                            </tr>
                        ) : (
                            filteredIncidents.map(incident => (
                                <tr key={incident.incidentId}>
                                    <td>#{incident.incidentId}</td>
                                    <td>{incident.stationName || `Trạm #${incident.stationId}`}</td>
                                    <td>{getTypeLabel(incident.incidentType)}</td>
                                    <td>
                                        <span className={`badge ${getSeverityBadgeClass(incident.severity)}`}>
                                            {incident.severity}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getPriorityBadgeClass(incident.priority)}`}>
                                            {incident.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(incident.status)}`}>
                                            {getStatusLabel(incident.status)}
                                        </span>
                                    </td>
                                    <td>{incident.reportedBy || 'N/A'}</td>
                                    <td>
                                        {incident.assignedTo ? (
                                            <span>Staff #{incident.assignedTo}</span>
                                        ) : (
                                            <span className="text-muted">Chưa phân công</span>
                                        )}
                                    </td>
                                    <td>{new Date(incident.createdAt).toLocaleString('vi-VN')}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-view"
                                                onClick={() => handleViewDetail(incident)}
                                                title="Xem chi tiết"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button
                                                className="btn-history"
                                                onClick={() => handleViewHistory(incident)}
                                                title="Lịch sử"
                                            >
                                                <i className="fas fa-history"></i>
                                            </button>
                                            {incident.status !== 'resolved' && incident.status !== 'closed' && (
                                                <>
                                                    {!incident.assignedTo && (
                                                        <button
                                                            className="btn-assign"
                                                            onClick={() => {
                                                                setSelectedIncident(incident);
                                                                setShowAssignModal(true);
                                                            }}
                                                            title="Phân công"
                                                        >
                                                            <i className="fas fa-user-check"></i>
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn-priority"
                                                        onClick={() => {
                                                            setSelectedIncident(incident);
                                                            setPriorityForm({ priority: incident.priority, notes: '' });
                                                            setShowPriorityModal(true);
                                                        }}
                                                        title="Cập nhật ưu tiên"
                                                    >
                                                        <i className="fas fa-flag"></i>
                                                    </button>
                                                    {incident.status === 'in_progress' && (
                                                        <button
                                                            className="btn-resolve"
                                                            onClick={() => {
                                                                setSelectedIncident(incident);
                                                                setResolveForm({ resolutionNotes: '', resolutionRating: 5 });
                                                                setShowResolveModal(true);
                                                            }}
                                                            title="Xử lý"
                                                        >
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedIncident && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết sự cố #{selectedIncident.incidentId}</h2>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Trạm:</label>
                                    <span>{selectedIncident.stationName || `Trạm #${selectedIncident.stationId}`}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Điểm sạc:</label>
                                    <span>{selectedIncident.chargerId ? `#${selectedIncident.chargerId}` : 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Loại:</label>
                                    <span>{getTypeLabel(selectedIncident.incidentType)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Mức độ:</label>
                                    <span className={`badge ${getSeverityBadgeClass(selectedIncident.severity)}`}>
                                        {selectedIncident.severity}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Ưu tiên:</label>
                                    <span className={`badge ${getPriorityBadgeClass(selectedIncident.priority)}`}>
                                        {selectedIncident.priority}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Trạng thái:</label>
                                    <span className={`badge ${getStatusBadgeClass(selectedIncident.status)}`}>
                                        {getStatusLabel(selectedIncident.status)}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Người báo cáo:</label>
                                    <span>{selectedIncident.reportedBy || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Người được phân công:</label>
                                    <span>{selectedIncident.assignedTo ? `Staff #${selectedIncident.assignedTo}` : 'Chưa phân công'}</span>
                                </div>
                                <div className="detail-item full-width">
                                    <label>Mô tả:</label>
                                    <span>{selectedIncident.description || 'Không có mô tả'}</span>
                                </div>
                                {selectedIncident.resolutionNotes && (
                                    <div className="detail-item full-width">
                                        <label>Ghi chú xử lý:</label>
                                        <span>{selectedIncident.resolutionNotes}</span>
                                    </div>
                                )}
                                {selectedIncident.resolutionRating && (
                                    <div className="detail-item">
                                        <label>Đánh giá:</label>
                                        <span>{'⭐'.repeat(selectedIncident.resolutionRating)}</span>
                                    </div>
                                )}
                                <div className="detail-item">
                                    <label>Thời gian tạo:</label>
                                    <span>{new Date(selectedIncident.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                                {selectedIncident.resolvedAt && (
                                    <div className="detail-item">
                                        <label>Thời gian xử lý:</label>
                                        <span>{new Date(selectedIncident.resolvedAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && selectedIncident && (
                <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Phân công xử lý sự cố #{selectedIncident.incidentId}</h2>
                            <button className="modal-close" onClick={() => setShowAssignModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>ID Nhân viên được phân công:</label>
                                <input
                                    type="number"
                                    value={assignForm.assignedTo}
                                    onChange={(e) => setAssignForm({ ...assignForm, assignedTo: e.target.value })}
                                    placeholder="Nhập ID nhân viên"
                                />
                            </div>
                            <div className="form-group">
                                <label>Ghi chú:</label>
                                <textarea
                                    value={assignForm.notes}
                                    onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                                    placeholder="Ghi chú (tùy chọn)"
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowAssignModal(false)}>Hủy</button>
                            <button className="btn-primary" onClick={handleAssign}>Phân công</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Priority Modal */}
            {showPriorityModal && selectedIncident && (
                <div className="modal-overlay" onClick={() => setShowPriorityModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Cập nhật ưu tiên sự cố #{selectedIncident.incidentId}</h2>
                            <button className="modal-close" onClick={() => setShowPriorityModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Ưu tiên:</label>
                                <select
                                    value={priorityForm.priority}
                                    onChange={(e) => setPriorityForm({ ...priorityForm, priority: e.target.value })}
                                >
                                    <option value="low">Thấp</option>
                                    <option value="medium">Trung bình</option>
                                    <option value="high">Cao</option>
                                    <option value="urgent">Khẩn cấp</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ghi chú:</label>
                                <textarea
                                    value={priorityForm.notes}
                                    onChange={(e) => setPriorityForm({ ...priorityForm, notes: e.target.value })}
                                    placeholder="Lý do thay đổi ưu tiên (tùy chọn)"
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowPriorityModal(false)}>Hủy</button>
                            <button className="btn-primary" onClick={handleUpdatePriority}>Cập nhật</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resolve Modal */}
            {showResolveModal && selectedIncident && (
                <div className="modal-overlay" onClick={() => setShowResolveModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Xử lý sự cố #{selectedIncident.incidentId}</h2>
                            <button className="modal-close" onClick={() => setShowResolveModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Ghi chú xử lý: <span className="required">*</span></label>
                                <textarea
                                    value={resolveForm.resolutionNotes}
                                    onChange={(e) => setResolveForm({ ...resolveForm, resolutionNotes: e.target.value })}
                                    placeholder="Mô tả cách xử lý sự cố..."
                                    rows="5"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Đánh giá hiệu quả (1-5 sao):</label>
                                <select
                                    value={resolveForm.resolutionRating}
                                    onChange={(e) => setResolveForm({ ...resolveForm, resolutionRating: parseInt(e.target.value) })}
                                >
                                    <option value={1}>1 sao</option>
                                    <option value={2}>2 sao</option>
                                    <option value={3}>3 sao</option>
                                    <option value={4}>4 sao</option>
                                    <option value={5}>5 sao</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowResolveModal(false)}>Hủy</button>
                            <button className="btn-primary" onClick={handleResolve}>Xử lý xong</button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && selectedIncident && (
                <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Lịch sử xử lý sự cố #{selectedIncident.incidentId}</h2>
                            <button className="modal-close" onClick={() => setShowHistoryModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="history-timeline">
                                {incidentHistory.length === 0 ? (
                                    <div className="no-history">Chưa có lịch sử</div>
                                ) : (
                                    incidentHistory.map((history, index) => (
                                        <div key={history.historyId} className="history-item">
                                            <div className="history-icon">
                                                <i className="fas fa-circle"></i>
                                            </div>
                                            <div className="history-content">
                                                <div className="history-action">
                                                    {history.actionType === 'created' && 'Sự cố được tạo mới'}
                                                    {history.actionType === 'status_changed' && `Trạng thái: ${history.oldStatus} → ${history.newStatus}`}
                                                    {history.actionType === 'priority_changed' && `Ưu tiên: ${history.oldPriority} → ${history.newPriority}`}
                                                    {history.actionType === 'assigned' && `Phân công: ${history.oldAssignedTo || 'Chưa có'} → Staff #${history.newAssignedTo}`}
                                                    {history.actionType === 'resolved' && 'Sự cố đã được xử lý'}
                                                </div>
                                                <div className="history-meta">
                                                    <span>{history.actionByName || `User #${history.actionBy}`}</span>
                                                    <span>{new Date(history.createdAt).toLocaleString('vi-VN')}</span>
                                                </div>
                                                {history.notes && (
                                                    <div className="history-notes">{history.notes}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncidentManagement;

