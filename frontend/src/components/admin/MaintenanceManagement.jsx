// src/components/admin/MaintenanceManagement.jsx
import React, { useState, useEffect } from 'react';
import {
    getAllMaintenanceSchedules,
    getMaintenanceScheduleById,
    createMaintenanceSchedule,
    updateMaintenanceSchedule,
    startMaintenance,
    completeMaintenance,
    deleteMaintenanceSchedule,
    getUpcomingSchedules
} from '../../services/maintenanceService';
import { getAllStations, getStationChargers } from '../../services/stationService';
import '../../styles/AdminMaintenanceManagement.css';

const MaintenanceManagement = () => {
    const [schedules, setSchedules] = useState([]);
    const [filteredSchedules, setFilteredSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [stations, setStations] = useState([]);
    const [chargers, setChargers] = useState([]);
    const [loadingChargers, setLoadingChargers] = useState(false);
    
    // Filters
    const [viewMode, setViewMode] = useState('all'); // all, upcoming, in_progress, completed
    const [statusFilter, setStatusFilter] = useState('all');
    const [stationFilter, setStationFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Form states
    const [createForm, setCreateForm] = useState({
        stationId: '',
        chargerId: '',
        maintenanceType: 'preventive',
        title: '',
        description: '',
        scheduledStartTime: '',
        scheduledEndTime: '',
        assignedTo: '',
        recurrenceType: '',
        recurrenceInterval: '',
        notes: ''
    });

    const [editForm, setEditForm] = useState({});

    // Helper function to reset create form
    const resetCreateForm = () => {
        setCreateForm({
            stationId: '',
            chargerId: '',
            maintenanceType: 'preventive',
            title: '',
            description: '',
            scheduledStartTime: '',
            scheduledEndTime: '',
            assignedTo: '',
            recurrenceType: '',
            recurrenceInterval: '',
            notes: ''
        });
        setChargers([]);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    // Load stations when modal opens
    useEffect(() => {
        if (showCreateModal) {
            const loadStations = async () => {
                try {
                    const stationsData = await getAllStations();
                    setStations(Array.isArray(stationsData) ? stationsData : []);
                } catch (err) {
                    console.error('Error loading stations:', err);
                    setError('Không thể tải danh sách trạm sạc');
                }
            };
            if (stations.length === 0) {
                loadStations();
            }
        }
    }, [showCreateModal]);

    // Load chargers when station is selected
    useEffect(() => {
        if (createForm.stationId && showCreateModal) {
            const loadChargers = async () => {
                try {
                    setLoadingChargers(true);
                    const chargersData = await getStationChargers(parseInt(createForm.stationId));
                    setChargers(Array.isArray(chargersData) ? chargersData : []);
                } catch (err) {
                    console.error('Error loading chargers:', err);
                    setChargers([]);
                } finally {
                    setLoadingChargers(false);
                }
            };
            loadChargers();
        } else {
            setChargers([]);
            setCreateForm(prev => ({ ...prev, chargerId: '' }));
        }
    }, [createForm.stationId, showCreateModal]);

    useEffect(() => {
        applyFilters();
    }, [schedules, viewMode, statusFilter, stationFilter, searchQuery]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const [schedulesData, stationsData] = await Promise.all([
                getAllMaintenanceSchedules(),
                getAllStations()
            ]);
            
            setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
            setStations(Array.isArray(stationsData) ? stationsData : []);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Không thể tải dữ liệu bảo trì');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...schedules];

        // View mode filter
        if (viewMode === 'upcoming') {
            const now = new Date();
            filtered = filtered.filter(s => {
                const startTime = new Date(s.scheduledStartTime);
                return startTime > now && s.status === 'scheduled';
            });
        } else if (viewMode === 'in_progress') {
            filtered = filtered.filter(s => s.status === 'in_progress');
        } else if (viewMode === 'completed') {
            filtered = filtered.filter(s => s.status === 'completed');
        } else if (viewMode !== 'all') {
            filtered = filtered.filter(s => s.status === viewMode);
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        // Station filter
        if (stationFilter !== 'all') {
            filtered = filtered.filter(s => s.stationId === parseInt(stationFilter));
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.title?.toLowerCase().includes(query) ||
                s.description?.toLowerCase().includes(query) ||
                s.stationName?.toLowerCase().includes(query) ||
                s.scheduleId?.toString().includes(query)
            );
        }

        // Sort by scheduled start time
        filtered.sort((a, b) => {
            return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime);
        });

        setFilteredSchedules(filtered);
    };

    const handleCreate = async () => {
        if (!createForm.stationId || !createForm.title || !createForm.scheduledStartTime || !createForm.scheduledEndTime) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            const scheduleData = {
                ...createForm,
                stationId: parseInt(createForm.stationId),
                chargerId: createForm.chargerId ? parseInt(createForm.chargerId) : null,
                assignedTo: createForm.assignedTo ? parseInt(createForm.assignedTo) : null,
                recurrenceInterval: createForm.recurrenceInterval ? parseInt(createForm.recurrenceInterval) : null,
                recurrenceType: createForm.recurrenceType || null
            };
            
            await createMaintenanceSchedule(scheduleData);
            alert('Tạo lịch bảo trì thành công!');
            setShowCreateModal(false);
            resetCreateForm();
            fetchData();
        } catch (err) {
            console.error('Error creating schedule:', err);
            alert(err.response?.data?.message || 'Không thể tạo lịch bảo trì');
        }
    };

    const handleStart = async (scheduleId) => {
        if (!window.confirm('Bắt đầu bảo trì này?')) return;

        try {
            await startMaintenance(scheduleId);
            alert('Đã bắt đầu bảo trì!');
            fetchData();
        } catch (err) {
            console.error('Error starting maintenance:', err);
            alert(err.response?.data?.message || 'Không thể bắt đầu bảo trì');
        }
    };

    const handleComplete = async (scheduleId) => {
        const notes = window.prompt('Nhập ghi chú hoàn thành (tùy chọn):');
        if (notes === null) return; // User cancelled

        try {
            await completeMaintenance(scheduleId, notes || '');
            alert('Đã hoàn thành bảo trì!');
            fetchData();
        } catch (err) {
            console.error('Error completing maintenance:', err);
            alert(err.response?.data?.message || 'Không thể hoàn thành bảo trì');
        }
    };

    const handleDelete = async (scheduleId) => {
        if (!window.confirm('Xóa lịch bảo trì này?')) return;

        try {
            await deleteMaintenanceSchedule(scheduleId);
            alert('Đã xóa lịch bảo trì!');
            fetchData();
        } catch (err) {
            console.error('Error deleting schedule:', err);
            alert(err.response?.data?.message || 'Không thể xóa lịch bảo trì');
        }
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            scheduled: 'status-scheduled',
            in_progress: 'status-in-progress',
            completed: 'status-completed',
            cancelled: 'status-cancelled',
            skipped: 'status-skipped'
        };
        return classes[status] || 'status-scheduled';
    };

    const getStatusLabel = (status) => {
        const labels = {
            scheduled: 'Đã lên lịch',
            in_progress: 'Đang thực hiện',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy',
            skipped: 'Đã bỏ qua'
        };
        return labels[status] || status;
    };

    const getTypeLabel = (type) => {
        const labels = {
            preventive: 'Phòng ngừa',
            corrective: 'Sửa chữa',
            emergency: 'Khẩn cấp',
            upgrade: 'Nâng cấp',
            inspection: 'Kiểm tra'
        };
        return labels[type] || type;
    };

    if (loading && !schedules.length) {
        return (
            <div className="maintenance-management">
                <div className="loading-spinner">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="maintenance-management">
            <div className="maintenance-header">
                <h1>Quản lý bảo trì</h1>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={fetchData}>
                        <i className="fas fa-sync-alt"></i> Làm mới
                    </button>
                    <button className="btn-create" onClick={() => {
                        resetCreateForm();
                        setShowCreateModal(true);
                    }}>
                        <i className="fas fa-plus"></i> Tạo lịch bảo trì
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="maintenance-filters">
                <div className="filter-group">
                    <label>Chế độ xem:</label>
                    <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="upcoming">Sắp tới</option>
                        <option value="in_progress">Đang thực hiện</option>
                        <option value="completed">Hoàn thành</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Trạng thái:</label>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">Tất cả</option>
                        <option value="scheduled">Đã lên lịch</option>
                        <option value="in_progress">Đang thực hiện</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
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

            {/* Schedules Table */}
            <div className="schedules-table-container">
                <table className="schedules-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tiêu đề</th>
                            <th>Trạm</th>
                            <th>Loại</th>
                            <th>Thời gian dự kiến</th>
                            <th>Thời gian thực tế</th>
                            <th>Người được phân công</th>
                            <th>Trạng thái</th>
                            <th>Lặp lại</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSchedules.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="no-data">Không có lịch bảo trì nào</td>
                            </tr>
                        ) : (
                            filteredSchedules.map(schedule => (
                                <tr key={schedule.scheduleId}>
                                    <td>#{schedule.scheduleId}</td>
                                    <td>{schedule.title}</td>
                                    <td>{schedule.stationName || `Trạm #${schedule.stationId}`}</td>
                                    <td>{getTypeLabel(schedule.maintenanceType)}</td>
                                    <td>
                                        <div>{new Date(schedule.scheduledStartTime).toLocaleString('vi-VN')}</div>
                                        <div className="text-muted small">
                                            → {new Date(schedule.scheduledEndTime).toLocaleString('vi-VN')}
                                        </div>
                                    </td>
                                    <td>
                                        {schedule.actualStartTime ? (
                                            <>
                                                <div>{new Date(schedule.actualStartTime).toLocaleString('vi-VN')}</div>
                                                {schedule.actualEndTime && (
                                                    <div className="text-muted small">
                                                        → {new Date(schedule.actualEndTime).toLocaleString('vi-VN')}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-muted">Chưa bắt đầu</span>
                                        )}
                                    </td>
                                    <td>
                                        {schedule.assignedTo ? (
                                            <span>Staff #{schedule.assignedTo}</span>
                                        ) : (
                                            <span className="text-muted">Chưa phân công</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(schedule.status)}`}>
                                            {getStatusLabel(schedule.status)}
                                        </span>
                                    </td>
                                    <td>
                                        {schedule.recurrenceType ? (
                                            <span className="badge badge-info">
                                                {schedule.recurrenceType} ({schedule.recurrenceInterval})
                                            </span>
                                        ) : (
                                            <span className="text-muted">Một lần</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-view"
                                                onClick={() => {
                                                    setSelectedSchedule(schedule);
                                                    setShowDetailModal(true);
                                                }}
                                                title="Xem chi tiết"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            {schedule.status === 'scheduled' && (
                                                <button
                                                    className="btn-start"
                                                    onClick={() => handleStart(schedule.scheduleId)}
                                                    title="Bắt đầu"
                                                >
                                                    <i className="fas fa-play"></i>
                                                </button>
                                            )}
                                            {schedule.status === 'in_progress' && (
                                                <button
                                                    className="btn-complete"
                                                    onClick={() => handleComplete(schedule.scheduleId)}
                                                    title="Hoàn thành"
                                                >
                                                    <i className="fas fa-check"></i>
                                                </button>
                                            )}
                                            {schedule.status === 'scheduled' && (
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(schedule.scheduleId)}
                                                    title="Xóa"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                }}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Tạo lịch bảo trì</h2>
                            <button className="modal-close" onClick={() => {
                                setShowCreateModal(false);
                                resetCreateForm();
                            }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Trạm: <span className="required">*</span></label>
                                <select
                                    value={createForm.stationId}
                                    onChange={(e) => setCreateForm({ ...createForm, stationId: e.target.value })}
                                    required
                                    disabled={stations.length === 0}
                                >
                                    <option value="">
                                        {stations.length === 0 ? 'Đang tải danh sách trạm...' : 'Chọn trạm'}
                                    </option>
                                    {stations.map(station => (
                                        <option key={station.stationId} value={station.stationId}>
                                            {station.stationName || station.stationCode || `Trạm #${station.stationId}`}
                                        </option>
                                    ))}
                                </select>
                                {stations.length === 0 && (
                                    <small className="form-hint">Đang tải danh sách trạm sạc...</small>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Điểm sạc (tùy chọn):</label>
                                {createForm.stationId ? (
                                    <select
                                        value={createForm.chargerId}
                                        onChange={(e) => setCreateForm({ ...createForm, chargerId: e.target.value })}
                                        disabled={loadingChargers}
                                    >
                                        <option value="">
                                            {loadingChargers ? 'Đang tải...' : 'Chọn điểm sạc (hoặc để trống cho bảo trì toàn trạm)'}
                                        </option>
                                        {chargers.map(charger => (
                                            <option key={charger.chargerId} value={charger.chargerId}>
                                                {charger.chargerCode || `Điểm sạc #${charger.chargerId}`} 
                                                {charger.chargerType ? ` - ${charger.chargerType}` : ''}
                                                {charger.powerRating ? ` (${charger.powerRating}kW)` : ''}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value=""
                                        disabled
                                        placeholder="Vui lòng chọn trạm trước"
                                    />
                                )}
                            </div>
                            <div className="form-group">
                                <label>Loại bảo trì: <span className="required">*</span></label>
                                <select
                                    value={createForm.maintenanceType}
                                    onChange={(e) => setCreateForm({ ...createForm, maintenanceType: e.target.value })}
                                    required
                                >
                                    <option value="preventive">Phòng ngừa</option>
                                    <option value="corrective">Sửa chữa</option>
                                    <option value="emergency">Khẩn cấp</option>
                                    <option value="upgrade">Nâng cấp</option>
                                    <option value="inspection">Kiểm tra</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Tiêu đề: <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={createForm.title}
                                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                                    placeholder="Tiêu đề bảo trì"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Mô tả:</label>
                                <textarea
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                    placeholder="Mô tả công việc bảo trì"
                                    rows="3"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Thời gian bắt đầu: <span className="required">*</span></label>
                                    <input
                                        type="datetime-local"
                                        value={createForm.scheduledStartTime}
                                        onChange={(e) => setCreateForm({ ...createForm, scheduledStartTime: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Thời gian kết thúc: <span className="required">*</span></label>
                                    <input
                                        type="datetime-local"
                                        value={createForm.scheduledEndTime}
                                        onChange={(e) => setCreateForm({ ...createForm, scheduledEndTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Người được phân công (tùy chọn):</label>
                                <input
                                    type="number"
                                    value={createForm.assignedTo}
                                    onChange={(e) => setCreateForm({ ...createForm, assignedTo: e.target.value })}
                                    placeholder="ID nhân viên"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Lặp lại:</label>
                                    <select
                                        value={createForm.recurrenceType}
                                        onChange={(e) => setCreateForm({ ...createForm, recurrenceType: e.target.value })}
                                    >
                                        <option value="">Không lặp lại</option>
                                        <option value="daily">Hàng ngày</option>
                                        <option value="weekly">Hàng tuần</option>
                                        <option value="monthly">Hàng tháng</option>
                                        <option value="quarterly">Hàng quý</option>
                                        <option value="yearly">Hàng năm</option>
                                    </select>
                                </div>
                                {createForm.recurrenceType && (
                                    <div className="form-group">
                                        <label>Khoảng cách:</label>
                                        <input
                                            type="number"
                                            value={createForm.recurrenceInterval}
                                            onChange={(e) => setCreateForm({ ...createForm, recurrenceInterval: e.target.value })}
                                            placeholder="Số"
                                            min="1"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Ghi chú:</label>
                                <textarea
                                    value={createForm.notes}
                                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                                    placeholder="Ghi chú (tùy chọn)"
                                    rows="2"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => {
                                setShowCreateModal(false);
                                resetCreateForm();
                            }}>Hủy</button>
                            <button className="btn-primary" onClick={handleCreate}>Tạo lịch</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedSchedule && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết lịch bảo trì #{selectedSchedule.scheduleId}</h2>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Tiêu đề:</label>
                                    <span>{selectedSchedule.title}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Trạm:</label>
                                    <span>{selectedSchedule.stationName || `Trạm #${selectedSchedule.stationId}`}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Điểm sạc:</label>
                                    <span>{selectedSchedule.chargerId ? `#${selectedSchedule.chargerId}` : 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Loại:</label>
                                    <span>{getTypeLabel(selectedSchedule.maintenanceType)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Trạng thái:</label>
                                    <span className={`badge ${getStatusBadgeClass(selectedSchedule.status)}`}>
                                        {getStatusLabel(selectedSchedule.status)}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <label>Người được phân công:</label>
                                    <span>{selectedSchedule.assignedTo ? `Staff #${selectedSchedule.assignedTo}` : 'Chưa phân công'}</span>
                                </div>
                                <div className="detail-item full-width">
                                    <label>Mô tả:</label>
                                    <span>{selectedSchedule.description || 'Không có mô tả'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Thời gian dự kiến bắt đầu:</label>
                                    <span>{new Date(selectedSchedule.scheduledStartTime).toLocaleString('vi-VN')}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Thời gian dự kiến kết thúc:</label>
                                    <span>{new Date(selectedSchedule.scheduledEndTime).toLocaleString('vi-VN')}</span>
                                </div>
                                {selectedSchedule.actualStartTime && (
                                    <div className="detail-item">
                                        <label>Thời gian thực tế bắt đầu:</label>
                                        <span>{new Date(selectedSchedule.actualStartTime).toLocaleString('vi-VN')}</span>
                                    </div>
                                )}
                                {selectedSchedule.actualEndTime && (
                                    <div className="detail-item">
                                        <label>Thời gian thực tế kết thúc:</label>
                                        <span>{new Date(selectedSchedule.actualEndTime).toLocaleString('vi-VN')}</span>
                                    </div>
                                )}
                                {selectedSchedule.recurrenceType && (
                                    <div className="detail-item">
                                        <label>Lặp lại:</label>
                                        <span>{selectedSchedule.recurrenceType} (mỗi {selectedSchedule.recurrenceInterval})</span>
                                    </div>
                                )}
                                {selectedSchedule.nextScheduledTime && (
                                    <div className="detail-item">
                                        <label>Lần tiếp theo:</label>
                                        <span>{new Date(selectedSchedule.nextScheduledTime).toLocaleString('vi-VN')}</span>
                                    </div>
                                )}
                                {selectedSchedule.notes && (
                                    <div className="detail-item full-width">
                                        <label>Ghi chú:</label>
                                        <span>{selectedSchedule.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceManagement;

