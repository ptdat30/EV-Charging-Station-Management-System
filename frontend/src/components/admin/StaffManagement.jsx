// src/components/admin/StaffManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllUsers } from '../../services/userService';
import apiClient from '../../config/api';
import '../../styles/AdminStaffManagement.css';

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Permissions state
  const [staffPermissions, setStaffPermissions] = useState({
    view_stations: false,
    manage_sessions: false,
    handle_payments: false,
    monitor_stations: false,
    view_reports: false,
    manage_incidents: false,
    update_station_status: false,
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...staffList];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(staff =>
        staff.fullName?.toLowerCase().includes(query) ||
        staff.email?.toLowerCase().includes(query) ||
        staff.phone?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(staff => staff.status === statusFilter);
    }

    // Sort by name
    filtered.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));

    setFilteredStaff(filtered);
  }, [staffList, searchQuery, statusFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers();
      const data = response.data || response || [];
      
      // Chỉ lấy staff users
      const staffUsers = Array.isArray(data) 
        ? data.filter(user => user.userType === 'staff' || user.role === 'STAFF')
        : [];
      
      console.log(`✅ Loaded ${staffUsers.length} staff members`);
      setStaffList(staffUsers);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleManagePermissions = (staff) => {
    setSelectedStaff(staff);
    // Load current permissions from staff object or API
    const permissions = staff.permissions || staff.roles || {};
    setStaffPermissions({
      view_stations: permissions.view_stations || false,
      manage_sessions: permissions.manage_sessions || false,
      handle_payments: permissions.handle_payments || false,
      monitor_stations: permissions.monitor_stations || false,
      view_reports: permissions.view_reports || false,
      manage_incidents: permissions.manage_incidents || false,
      update_station_status: permissions.update_station_status || false,
    });
    setShowPermissionsModal(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff) return;

    try {
      setLoading(true);
      await apiClient.put(`/users/${selectedStaff.userId || selectedStaff.id}/permissions`, {
        permissions: staffPermissions
      });
      await fetchStaff();
      setShowPermissionsModal(false);
      setSelectedStaff(null);
      alert('Cập nhật phân quyền thành công!');
    } catch (err) {
      console.error('Error updating permissions:', err);
      alert(err.response?.data?.message || 'Không thể cập nhật phân quyền');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setEditForm({
      fullName: staff.fullName || '',
      email: staff.email || '',
      phone: staff.phone || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;

    try {
      setLoading(true);
      await apiClient.put(`/users/${selectedStaff.userId || selectedStaff.id}`, {
        fullName: editForm.fullName,
        phone: editForm.phone,
      });
      await fetchStaff();
      setShowEditModal(false);
      setSelectedStaff(null);
      alert('Cập nhật nhân viên thành công!');
    } catch (err) {
      console.error('Error updating staff:', err);
      alert(err.response?.data?.message || 'Không thể cập nhật nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      return;
    }

    try {
      setLoading(true);
      await apiClient.delete(`/users/${staffId}`);
      await fetchStaff();
      alert('Xóa nhân viên thành công!');
    } catch (err) {
      console.error('Error deleting staff:', err);
      alert(err.response?.data?.message || 'Không thể xóa nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Hoạt động', color: '#10b981', bg: '#d1fae5' },
      inactive: { label: 'Không hoạt động', color: '#6b7280', bg: '#f3f4f6' },
      locked: { label: 'Đã khóa', color: '#ef4444', bg: '#fee2e2' },
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const permissionLabels = {
    view_stations: 'Xem trạm sạc',
    manage_sessions: 'Quản lý phiên sạc',
    handle_payments: 'Xử lý thanh toán',
    monitor_stations: 'Giám sát trạm',
    view_reports: 'Xem báo cáo',
    manage_incidents: 'Quản lý sự cố',
    update_station_status: 'Cập nhật trạng thái trạm',
  };

  if (loading && staffList.length === 0) {
    return (
      <div className="staff-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách nhân viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-management">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Quản lý Nhân viên</h2>
          <p>Quản lý nhân viên trạm và phân quyền</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchStaff}>
            <i className="fas fa-refresh"></i>
            Làm mới
          </button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <i className="fas fa-plus"></i>
            Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-value">{staffList.length}</div>
          <div className="stat-label">Tổng nhân viên</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#10b981' }}>
            {staffList.filter(s => s.status === 'active').length}
          </div>
          <div className="stat-label">Đang hoạt động</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#6b7280' }}>
            {staffList.filter(s => s.status !== 'active').length}
          </div>
          <div className="stat-label">Không hoạt động</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
          <option value="locked">Đã khóa</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchStaff}>
            Thử lại
          </button>
        </div>
      )}

      {/* Staff Table */}
      {!error && (
        <div className="staff-table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data-cell">
                    <i className="fas fa-inbox"></i>
                    <p>Không tìm thấy nhân viên nào</p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.userId || staff.id}>
                    <td>
                      <span className="staff-id">#{staff.userId || staff.id}</span>
                    </td>
                    <td>
                      <strong>{staff.fullName || 'Chưa có tên'}</strong>
                    </td>
                    <td>
                      <span className="email-text">{staff.email}</span>
                    </td>
                    <td>
                      <span className="phone-text">{staff.phone || '-'}</span>
                    </td>
                    <td>{getStatusBadge(staff.status)}</td>
                    <td>
                      <span className="date-text">{formatDate(staff.createdAt)}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-permissions"
                          onClick={() => handleManagePermissions(staff)}
                          title="Phân quyền"
                          style={{ background: '#8b5cf6', color: 'white' }}
                        >
                          <i className="fas fa-user-shield"></i>
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEditStaff(staff)}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDeleteStaff(staff.userId || staff.id)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedStaff && (
        <div className="modal-overlay" onClick={() => { setShowPermissionsModal(false); setSelectedStaff(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-user-shield" style={{ marginRight: '10px', color: '#8b5cf6' }}></i>
                Phân quyền Nhân viên
              </h3>
              <button className="modal-close" onClick={() => { setShowPermissionsModal(false); setSelectedStaff(null); }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <strong>Nhân viên:</strong>
                <p style={{ marginTop: '5px', color: '#6b7280' }}>
                  {selectedStaff.fullName || 'Chưa có tên'} ({selectedStaff.email})
                </p>
              </div>
              <div>
                <strong>Phân quyền:</strong>
                <div style={{ marginTop: '15px', display: 'grid', gap: '12px' }}>
                  {Object.keys(permissionLabels).map((permission) => (
                    <label
                      key={permission}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: staffPermissions[permission] ? '#f0f9ff' : 'white',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={staffPermissions[permission]}
                        onChange={(e) =>
                          setStaffPermissions({
                            ...staffPermissions,
                            [permission]: e.target.checked,
                          })
                        }
                        style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span>{permissionLabels[permission]}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => { setShowPermissionsModal(false); setSelectedStaff(null); }}
              >
                Hủy
              </button>
              <button className="btn-primary" onClick={handleSavePermissions} disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Lưu phân quyền
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && selectedStaff && (
        <div className="modal-overlay" onClick={() => { setShowEditModal(false); setSelectedStaff(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-edit" style={{ marginRight: '10px', color: '#3b82f6' }}></i>
                Chỉnh sửa Nhân viên
              </h3>
              <button className="modal-close" onClick={() => { setShowEditModal(false); setSelectedStaff(null); }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleUpdateStaff} className="modal-body">
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Họ và tên:</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
                <input
                  type="email"
                  value={editForm.email}
                  disabled
                  style={{ width: '100%', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', background: '#f9fafb' }}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>Email không thể thay đổi</p>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Số điện thoại:</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowEditModal(false); setSelectedStaff(null); }}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Lưu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Staff Modal - Similar to UsersManagement */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-user-plus" style={{ marginRight: '10px', color: '#10b981' }}></i>
                Thêm Nhân viên
              </h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                Vui lòng tạo tài khoản nhân viên trong trang Quản lý Người dùng với loại "Nhân viên".
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Đóng
              </button>
              <button className="btn-primary" onClick={() => {
                setShowCreateModal(false);
                window.location.href = '/admin/users';
              }}>
                Đi tới Quản lý Người dùng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;

