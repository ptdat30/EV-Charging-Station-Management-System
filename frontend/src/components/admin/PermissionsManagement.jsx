// src/components/admin/PermissionsManagement.jsx
import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/userService';
import apiClient from '../../config/api';
import '../../styles/AdminPermissionsManagement.css';

const PermissionsManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Permissions matrix
  const [permissions, setPermissions] = useState({
    driver: {
      view_stations: true,
      make_reservation: true,
      start_charging: true,
      view_own_transactions: true,
      manage_own_vehicles: true,
      view_reports: false,
      manage_stations: false,
      manage_users: false,
      manage_packages: false,
      view_all_transactions: false,
    },
    staff: {
      view_stations: true,
      make_reservation: true,
      start_charging: true,
      view_own_transactions: true,
      manage_own_vehicles: true,
      view_reports: true,
      manage_stations: false,
      manage_users: false,
      manage_packages: false,
      view_all_transactions: true,
      monitor_stations: true,
      handle_payments: true,
    },
    admin: {
      view_stations: true,
      make_reservation: true,
      start_charging: true,
      view_own_transactions: true,
      manage_own_vehicles: true,
      view_reports: true,
      manage_stations: true,
      manage_users: true,
      manage_packages: true,
      view_all_transactions: true,
      monitor_stations: true,
      handle_payments: true,
      system_settings: true,
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers();
      const data = response.data || response || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.userType === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Bạn có chắc chắn muốn thay đổi quyền của người dùng này thành "${getRoleLabel(newRole)}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await apiClient.put(`/users/${userId}`, {
        userType: newRole,
      });
      await fetchUsers();
      alert('Thay đổi quyền thành công!');
    } catch (err) {
      console.error('Error updating user role:', err);
      alert(err.response?.data?.message || 'Không thể thay đổi quyền');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPermissions = (user) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const getRoleLabel = (role) => {
    const labels = {
      driver: 'Tài xế',
      staff: 'Nhân viên',
      admin: 'Quản trị viên',
    };
    return labels[role] || role;
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      driver: { label: 'Tài xế', color: '#3b82f6', bg: '#dbeafe', icon: 'fa-user' },
      staff: { label: 'Nhân viên', color: '#8b5cf6', bg: '#ede9fe', icon: 'fa-user-tie' },
      admin: { label: 'Quản trị viên', color: '#ef4444', bg: '#fee2e2', icon: 'fa-user-shield' },
    };
    const config = roleConfig[role] || roleConfig.driver;
    return (
      <span className="role-badge" style={{ color: config.color, background: config.bg }}>
        <i className={`fas ${config.icon}`}></i>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Hoạt động', color: '#10b981', bg: '#d1fae5' },
      inactive: { label: 'Không hoạt động', color: '#6b7280', bg: '#f3f4f6' },
      suspended: { label: 'Tạm khóa', color: '#ef4444', bg: '#fee2e2' },
      deleted: { label: 'Đã xóa', color: '#64748b', bg: '#f1f5f9' },
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const getPermissionLabel = (permission) => {
    const labels = {
      view_stations: 'Xem trạm sạc',
      make_reservation: 'Đặt chỗ',
      start_charging: 'Bắt đầu sạc',
      view_own_transactions: 'Xem giao dịch của mình',
      manage_own_vehicles: 'Quản lý xe của mình',
      view_reports: 'Xem báo cáo',
      manage_stations: 'Quản lý trạm sạc',
      manage_users: 'Quản lý người dùng',
      manage_packages: 'Quản lý gói dịch vụ',
      view_all_transactions: 'Xem tất cả giao dịch',
      monitor_stations: 'Giám sát trạm sạc',
      handle_payments: 'Xử lý thanh toán',
      system_settings: 'Cài đặt hệ thống',
    };
    return labels[permission] || permission;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="permissions-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="permissions-management">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Quản lý Phân quyền</h2>
          <p>Quản lý quyền truy cập và vai trò của người dùng trong hệ thống</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchUsers}>
            <i className="fas fa-refresh"></i>
            Làm mới
          </button>
          <button className="btn-primary" onClick={() => setShowPermissionsModal(true)}>
            <i className="fas fa-cog"></i>
            Quyền theo vai trò
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Tổng người dùng</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {users.filter(u => u.userType === 'driver').length}
          </div>
          <div className="stat-label">Tài xế</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#8b5cf6' }}>
            {users.filter(u => u.userType === 'staff').length}
          </div>
          <div className="stat-label">Nhân viên</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {users.filter(u => u.userType === 'admin').length}
          </div>
          <div className="stat-label">Quản trị viên</div>
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="driver">Tài xế</option>
          <option value="staff">Nhân viên</option>
          <option value="admin">Quản trị viên</option>
        </select>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
          <option value="suspended">Tạm khóa</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchUsers}>
            Thử lại
          </button>
        </div>
      )}

      {/* Users Table */}
      {!error && (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Vai trò hiện tại</th>
                <th>Trạng thái</th>
                <th>Thay đổi vai trò</th>
                <th>Quyền</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data-cell">
                    <i className="fas fa-inbox"></i>
                    <p>Không tìm thấy người dùng nào</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId || user.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{user.fullName || 'Chưa có tên'}</strong>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(user.userType)}</td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>
                      <select
                        className="role-select"
                        value={user.userType}
                        onChange={(e) => handleChangeRole(user.userId || user.id, e.target.value)}
                        disabled={loading || user.userType === 'admin'}
                        onClick={(e) => e.stopPropagation()}
                        title={user.userType === 'admin' ? 'Không thể thay đổi quyền admin' : 'Thay đổi vai trò'}
                      >
                        <option value="driver">Tài xế</option>
                        <option value="staff">Nhân viên</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn-action btn-view"
                        onClick={() => handleViewPermissions(user)}
                        title="Xem quyền chi tiết"
                      >
                        <i className="fas fa-eye"></i>
                        Xem quyền
                      </button>
                    </td>
                    <td>
                      <span className="date-text">{formatDate(user.createdAt)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Permissions Detail Modal */}
      {showModal && selectedUser && (
        <UserPermissionsModal
          user={selectedUser}
          permissions={permissions[selectedUser.userType] || {}}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Role Permissions Matrix Modal */}
      {showPermissionsModal && (
        <RolePermissionsModal
          permissions={permissions}
          onClose={() => setShowPermissionsModal(false)}
        />
      )}
    </div>
  );
};

// User Permissions Modal Component
const UserPermissionsModal = ({ user, permissions, onClose }) => {
  const getRoleLabel = (role) => {
    const labels = {
      driver: 'Tài xế',
      staff: 'Nhân viên',
      admin: 'Quản trị viên',
    };
    return labels[role] || role;
  };

  const getPermissionLabel = (permission) => {
    const labels = {
      view_stations: 'Xem trạm sạc',
      make_reservation: 'Đặt chỗ',
      start_charging: 'Bắt đầu sạc',
      view_own_transactions: 'Xem giao dịch của mình',
      manage_own_vehicles: 'Quản lý xe của mình',
      view_reports: 'Xem báo cáo',
      manage_stations: 'Quản lý trạm sạc',
      manage_users: 'Quản lý người dùng',
      manage_packages: 'Quản lý gói dịch vụ',
      view_all_transactions: 'Xem tất cả giao dịch',
      monitor_stations: 'Giám sát trạm sạc',
      handle_payments: 'Xử lý thanh toán',
      system_settings: 'Cài đặt hệ thống',
    };
    return labels[permission] || permission;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Quyền của {user.fullName || user.email}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="permissions-info">
            <div className="info-row">
              <span className="info-label">Vai trò:</span>
              <span className="info-value">{getRoleLabel(user.userType)}</span>
            </div>
            <div className="permissions-list">
              <h4>Danh sách quyền:</h4>
              <ul>
                {Object.entries(permissions).map(([key, value]) => (
                  <li key={key} className={value ? 'permission-allowed' : 'permission-denied'}>
                    {value ? (
                      <i className="fas fa-check-circle"></i>
                    ) : (
                      <i className="fas fa-times-circle"></i>
                    )}
                    <span>{getPermissionLabel(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

// Role Permissions Matrix Modal Component
const RolePermissionsModal = ({ permissions, onClose }) => {
  const getRoleLabel = (role) => {
    const labels = {
      driver: 'Tài xế',
      staff: 'Nhân viên',
      admin: 'Quản trị viên',
    };
    return labels[role] || role;
  };

  const getPermissionLabel = (permission) => {
    const labels = {
      view_stations: 'Xem trạm sạc',
      make_reservation: 'Đặt chỗ',
      start_charging: 'Bắt đầu sạc',
      view_own_transactions: 'Xem giao dịch của mình',
      manage_own_vehicles: 'Quản lý xe của mình',
      view_reports: 'Xem báo cáo',
      manage_stations: 'Quản lý trạm sạc',
      manage_users: 'Quản lý người dùng',
      manage_packages: 'Quản lý gói dịch vụ',
      view_all_transactions: 'Xem tất cả giao dịch',
      monitor_stations: 'Giám sát trạm sạc',
      handle_payments: 'Xử lý thanh toán',
      system_settings: 'Cài đặt hệ thống',
    };
    return labels[permission] || permission;
  };

  // Get all unique permissions
  const allPermissions = new Set();
  Object.values(permissions).forEach(rolePerms => {
    Object.keys(rolePerms).forEach(perm => allPermissions.add(perm));
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-extra-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Ma trận Phân quyền theo Vai trò</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="permissions-matrix">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Quyền</th>
                  <th>Tài xế</th>
                  <th>Nhân viên</th>
                  <th>Quản trị viên</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(allPermissions).map((permission) => (
                  <tr key={permission}>
                    <td className="permission-name">{getPermissionLabel(permission)}</td>
                    <td className="permission-cell">
                      {permissions.driver?.[permission] ? (
                        <i className="fas fa-check" style={{ color: '#10b981' }}></i>
                      ) : (
                        <i className="fas fa-times" style={{ color: '#ef4444' }}></i>
                      )}
                    </td>
                    <td className="permission-cell">
                      {permissions.staff?.[permission] ? (
                        <i className="fas fa-check" style={{ color: '#10b981' }}></i>
                      ) : (
                        <i className="fas fa-times" style={{ color: '#ef4444' }}></i>
                      )}
                    </td>
                    <td className="permission-cell">
                      {permissions.admin?.[permission] ? (
                        <i className="fas fa-check" style={{ color: '#10b981' }}></i>
                      ) : (
                        <i className="fas fa-times" style={{ color: '#ef4444' }}></i>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsManagement;
