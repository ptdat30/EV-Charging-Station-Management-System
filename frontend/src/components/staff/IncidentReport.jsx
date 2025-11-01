// src/components/staff/IncidentReport.jsx
import React, { useState, useEffect } from 'react';
import { getAllStations } from '../../services/stationService';
import apiClient from '../../config/api';
import '../../styles/StaffIncidentReport.css';

const IncidentReport = () => {
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [stations, setStations] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [reportForm, setReportForm] = useState({
    stationId: '',
    chargerId: '',
    incidentType: 'equipment',
    severity: 'medium',
    description: '',
    reportedBy: '',
  });

  useEffect(() => {
    fetchStations();
    fetchIncidents();
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchIncidents, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStations = async () => {
    try {
      const response = await getAllStations().catch(() => ({ data: [] }));
      const stationsList = Array.isArray(response.data) 
        ? response.data 
        : response.data || [];
      setStations(stationsList);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/incidents').catch(() => ({ data: [] }));
      const incidentsList = Array.isArray(response.data) ? response.data : [];
      
      // Sort by createdAt descending
      incidentsList.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      setIncidents(incidentsList);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    
    if (!reportForm.stationId || !reportForm.description) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setActionLoading('submit');
      const payload = {
        stationId: parseInt(reportForm.stationId),
        chargerId: reportForm.chargerId ? parseInt(reportForm.chargerId) : null,
        incidentType: reportForm.incidentType.toUpperCase(),
        severity: reportForm.severity.toUpperCase(),
        description: reportForm.description,
        reportedBy: reportForm.reportedBy || null,
      };

      await apiClient.post('/incidents', payload);
      
      alert('✅ Đã báo cáo sự cố thành công!');
      setShowReportModal(false);
      setReportForm({
        stationId: '',
        chargerId: '',
        incidentType: 'equipment',
        severity: 'medium',
        description: '',
        reportedBy: '',
      });
      fetchIncidents();
    } catch (error) {
      console.error('Error creating incident:', error);
      alert(`❌ ${error.response?.data?.message || error.message || 'Không thể tạo báo cáo sự cố'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveIncident = async (incidentId) => {
    if (!confirm('Bạn có chắc chắn muốn đánh dấu sự cố này là đã xử lý?')) {
      return;
    }

    try {
      setActionLoading(incidentId);
      await apiClient.put(`/incidents/${incidentId}`, {
        status: 'resolved',
      });
      
      alert('✅ Đã đánh dấu sự cố là đã xử lý');
      fetchIncidents();
    } catch (error) {
      console.error('Error updating incident:', error);
      alert(`❌ ${error.response?.data?.message || error.message || 'Không thể cập nhật sự cố'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getSeverityBadge = (severity) => {
    const severityMap = {
      'low': { label: 'Thấp', color: '#10b981', bg: '#d1fae5' },
      'medium': { label: 'Trung bình', color: '#f59e0b', bg: '#fef3c7' },
      'high': { label: 'Cao', color: '#ef4444', bg: '#fee2e2' },
      'critical': { label: 'Nghiêm trọng', color: '#991b1b', bg: '#fee2e2' },
    };
    const config = severityMap[severity] || severityMap.medium;
    return (
      <span className="severity-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { label: 'Chờ xử lý', color: '#f59e0b', bg: '#fef3c7' },
      'in_progress': { label: 'Đang xử lý', color: '#3b82f6', bg: '#dbeafe' },
      'resolved': { label: 'Đã xử lý', color: '#10b981', bg: '#d1fae5' },
    };
    const config = statusMap[status] || statusMap.pending;
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    return true; // Can add filters here
  });

  return (
    <div className="incident-report">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Báo cáo Sự cố</h2>
          <p>Báo cáo và theo dõi các sự cố tại trạm sạc</p>
        </div>
        <button className="btn-primary" onClick={() => setShowReportModal(true)}>
          <i className="fas fa-plus"></i>
          Báo cáo sự cố mới
        </button>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-value">{incidents.length}</div>
          <div className="stat-label">Tổng sự cố</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {incidents.filter(i => i.status === 'pending').length}
          </div>
          <div className="stat-label">Chờ xử lý</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {incidents.filter(i => i.status === 'in_progress').length}
          </div>
          <div className="stat-label">Đang xử lý</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#10b981' }}>
            {incidents.filter(i => i.status === 'resolved').length}
          </div>
          <div className="stat-label">Đã xử lý</div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="incidents-list">
        {filteredIncidents.length === 0 ? (
          <div className="no-incidents">
            <i className="fas fa-clipboard-list"></i>
            <p>Chưa có báo cáo sự cố nào</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => (
            <div key={incident.id} className="incident-card">
              <div className="incident-card-header">
                <div>
                  <h4>
                    <i className="fas fa-exclamation-triangle"></i>
                    Sự cố #{incident.id}
                  </h4>
                  <p className="incident-meta">
                    {incident.stationName} 
                    {incident.chargerId && ` - Điểm sạc #${incident.chargerId}`}
                  </p>
                </div>
                <div className="incident-badges">
                  {getSeverityBadge(incident.severity)}
                  {getStatusBadge(incident.status)}
                </div>
              </div>

              <div className="incident-card-body">
                <div className="incident-details">
                  <div className="detail-item">
                    <label>Loại sự cố:</label>
                    <span>
                      {incident.incidentType === 'equipment' ? 'Thiết bị' :
                       incident.incidentType === 'power' ? 'Điện năng' :
                       incident.incidentType === 'network' ? 'Mạng' :
                       incident.incidentType === 'other' ? 'Khác' : incident.incidentType}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Thời gian báo cáo:</label>
                    <span>{formatDateTime(incident.createdAt)}</span>
                  </div>
                  {incident.reportedBy && (
                    <div className="detail-item">
                      <label>Người báo cáo:</label>
                      <span>{incident.reportedBy}</span>
                    </div>
                  )}
                </div>

                <div className="incident-description">
                  <label>Mô tả:</label>
                  <p>{incident.description}</p>
                </div>

                {incident.status !== 'resolved' && (
                  <div className="incident-actions">
                    <button
                      className="btn-resolve"
                      onClick={() => handleResolveIncident(incident.id)}
                    >
                      <i className="fas fa-check"></i>
                      Đánh dấu đã xử lý
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-exclamation-triangle"></i>
                Báo cáo Sự cố mới
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowReportModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmitReport} className="report-form">
              <div className="form-field">
                <label>
                  Trạm sạc <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  value={reportForm.stationId}
                  onChange={(e) => setReportForm({ ...reportForm, stationId: e.target.value, chargerId: '' })}
                  required
                >
                  <option value="">Chọn trạm sạc</option>
                  {stations.map(station => (
                    <option key={station.stationId || station.id} value={station.stationId || station.id}>
                      {station.stationName || station.stationCode}
                    </option>
                  ))}
                </select>
              </div>

              {reportForm.stationId && (
                <div className="form-field">
                  <label>Điểm sạc (tùy chọn)</label>
                  <select
                    className="form-control"
                    value={reportForm.chargerId}
                    onChange={(e) => setReportForm({ ...reportForm, chargerId: e.target.value })}
                  >
                    <option value="">Tất cả điểm sạc</option>
                    {(() => {
                      const station = stations.find(s => 
                        String(s.stationId || s.id) === String(reportForm.stationId)
                      );
                      const chargers = station?.chargers || [];
                      return chargers.map(charger => (
                        <option key={charger.chargerId || charger.id} value={charger.chargerId || charger.id}>
                          {charger.chargerCode || `Điểm sạc #${charger.chargerId || charger.id}`}
                        </option>
                      ));
                    })()}
                  </select>
                </div>
              )}

              <div className="form-field">
                <label>
                  Loại sự cố <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  value={reportForm.incidentType}
                  onChange={(e) => setReportForm({ ...reportForm, incidentType: e.target.value })}
                  required
                >
                  <option value="equipment">Thiết bị</option>
                  <option value="power">Điện năng</option>
                  <option value="network">Mạng</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="form-field">
                <label>
                  Mức độ nghiêm trọng <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  value={reportForm.severity}
                  onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                  required
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                  <option value="critical">Nghiêm trọng</option>
                </select>
              </div>

              <div className="form-field">
                <label>
                  Người báo cáo
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={reportForm.reportedBy}
                  onChange={(e) => setReportForm({ ...reportForm, reportedBy: e.target.value })}
                  placeholder="Tên nhân viên hoặc người báo cáo"
                />
              </div>

              <div className="form-field">
                <label>
                  Mô tả chi tiết <span className="required">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  required
                  placeholder="Mô tả chi tiết về sự cố..."
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <i className="fas fa-paper-plane"></i>
                  Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentReport;

