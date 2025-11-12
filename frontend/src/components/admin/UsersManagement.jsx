// src/components/admin/UsersManagement.jsx
import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../../services/userService';
import apiClient from '../../config/api';
import '../../styles/AdminUsersManagement.css';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Edit form
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    userType: 'driver',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, typeFilter, statusFilter, sortBy]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers();
      const data = response.data || response || [];
      
      // Deduplicate users by userId to prevent duplicate keys
      const usersArray = Array.isArray(data) ? data : [];
      const uniqueUsers = Array.from(
        new Map(usersArray.map(user => [user.userId || user.id, user])).values()
      );
      
      console.log(`✅ Loaded ${usersArray.length} users, ${uniqueUsers.length} unique`);
      setUsers(uniqueUsers);
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

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(user => user.userType === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.fullName || '').localeCompare(b.fullName || '');
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'type':
          return (a.userType || '').localeCompare(b.userType || '');
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      userType: user.userType || 'driver',
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setLoading(true);
      await apiClient.put(`/users/${selectedUser.userId || selectedUser.id}`, {
        fullName: editForm.fullName,
        phone: editForm.phone,
      });
      await fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
      alert('Cập nhật người dùng thành công!');
    } catch (err) {
      console.error('Error updating user:', err);
      alert(err.response?.data?.message || 'Không thể cập nhật người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setLoading(true);
      await apiClient.delete(`/users/${userId}`);
      await fetchUsers();
      if (selectedUser?.userId === userId || selectedUser?.id === userId) {
        setShowModal(false);
        setSelectedUser(null);
      }
      alert('Xóa người dùng thành công!');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || 'Không thể xóa người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = (user) => {
    setSelectedUser(user);
    setShowSubscriptionModal(true);
  };

  const handleUpdateSubscription = async (packageType, expiresAt) => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await apiClient.put(`/packages/subscription/${selectedUser.userId || selectedUser.id}`, {
        packageType: packageType || null,
        expiresAt: expiresAt || null
      });
      await fetchUsers();
      setShowSubscriptionModal(false);
      setSelectedUser(null);
      alert('Cập nhật gói dịch vụ thành công!');
    } catch (err) {
      console.error('Error updating subscription:', err);
      alert(err.response?.data?.message || 'Không thể cập nhật gói dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Hoạt động', color: '#10b981', bg: '#d1fae5' },
      inactive: { label: 'Không hoạt động', color: '#6b7280', bg: '#f3f4f6' },
      locked: { label: 'Đã khóa', color: '#ef4444', bg: '#fee2e2' },
      pending: { label: 'Chờ xác thực', color: '#f59e0b', bg: '#fef3c7' },
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (userType) => {
    const typeConfig = {
      driver: { label: 'Tài xế', color: '#3b82f6', bg: '#dbeafe' },
      staff: { label: 'Nhân viên', color: '#8b5cf6', bg: '#ede9fe' },
      admin: { label: 'Quản trị viên', color: '#ef4444', bg: '#fee2e2' },
    };
    const config = typeConfig[userType] || typeConfig.driver;
    return (
      <span className="type-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
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

  if (loading && users.length === 0) {
    return (
      <div className="users-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-management">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Quản lý Người dùng</h2>
          <p>Theo dõi và quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchUsers}>
            <i className="fas fa-refresh"></i>
            Làm mới
          </button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <i className="fas fa-plus"></i>
            Thêm người dùng
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
          <div className="stat-value" style={{ color: '#10b981' }}>
            {users.filter(u => u.status === 'active').length}
          </div>
          <div className="stat-label">Đang hoạt động</div>
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
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Tất cả loại</option>
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
          <option value="locked">Đã khóa</option>
          <option value="pending">Chờ xác thực</option>
        </select>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sắp xếp theo tên</option>
          <option value="email">Sắp xếp theo email</option>
          <option value="type">Sắp xếp theo loại</option>
          <option value="created">Mới nhất</option>
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
                <th>ID</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Loại</th>
                <th>Trạng thái</th>
                <th>Gói dịch vụ</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data-cell">
                    <i className="fas fa-inbox"></i>
                    <p>Không tìm thấy người dùng nào</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId || user.id}>
                    <td>
                      <span className="user-id">#{user.userId || user.id}</span>
                    </td>
                    <td>
                      <div className="user-name-cell">
                        <strong>{user.fullName || 'Chưa có tên'}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="email-text">{user.email}</span>
                    </td>
                    <td>
                      <span className="phone-text">{user.phone || '-'}</span>
                    </td>
                    <td>{getTypeBadge(user.userType)}</td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>
                      {user.subscriptionPackage ? (
                        <span className={`package-badge ${user.subscriptionPackage.toLowerCase()}`}>
                          {user.subscriptionPackage === 'SILVER' ? 'Bạc' : 
                           user.subscriptionPackage === 'GOLD' ? 'Vàng' : 
                           user.subscriptionPackage === 'PLATINUM' ? 'Bạch Kim' : user.subscriptionPackage}
                        </span>
                      ) : (
                        <span className="no-package">Chưa có</span>
                      )}
                    </td>
                    <td>
                      <span className="date-text">{formatDate(user.createdAt)}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewUser(user)}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEditUser(user)}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-action btn-package"
                          onClick={() => handleManageSubscription(user)}
                          title="Quản lý gói dịch vụ"
                          style={{ background: '#8b5cf6', color: 'white' }}
                        >
                          <i className="fas fa-box"></i>
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDeleteUser(user.userId || user.id)}
                          title="Xóa"
                          disabled={user.userType === 'admin'}
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

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          formData={editForm}
          setFormData={setEditForm}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            setEditForm({ fullName: '', email: '', phone: '', userType: 'driver' });
          }}
          onSubmit={handleUpdateUser}
          loading={loading}
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={async () => {
            setShowCreateModal(false);
            await fetchUsers();
          }}
          loading={loading}
        />
      )}

      {/* Subscription Management Modal */}
      {showSubscriptionModal && selectedUser && (
        <SubscriptionManagementModal
          user={selectedUser}
          onClose={() => {
            setShowSubscriptionModal(false);
            setSelectedUser(null);
          }}
          onUpdate={handleUpdateSubscription}
          loading={loading}
        />
      )}
    </div>
  );
};

// ==========================================
// Subscription Management Modal - REBUILT
// ==========================================
const SubscriptionManagementModal = ({ user, onClose, onUpdate, loading }) => {
  const [packageType, setPackageType] = useState(user?.subscriptionPackage || '');
  const [expiresAt, setExpiresAt] = useState(() => {
    if (user?.subscriptionExpiresAt) {
      try {
        return new Date(user.subscriptionExpiresAt).toISOString().split('T')[0];
      } catch {
        return '';
      }
    }
    return '';
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!packageType && !window.confirm('Bạn có chắc chắn muốn gỡ bỏ gói dịch vụ?')) {
      return;
    }
    const expiresAtDate = expiresAt ? new Date(expiresAt + 'T23:59:59').toISOString() : null;
    onUpdate(packageType || null, expiresAtDate);
  };

  const handleRemove = () => {
    if (window.confirm('⚠️ Bạn có chắc chắn muốn xóa gói dịch vụ của người dùng này? Hành động này không thể hoàn tác.')) {
      onUpdate(null, null);
    }
  };

  if (!user) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="modal-content modal-subscription" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        <div className="modal-header">
          <div>
            <h3>
              <i className="fas fa-box" style={{ marginRight: '10px', color: '#8b5cf6' }}></i>
              Quản lý Gói Dịch vụ
            </h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              Cấp hoặc thay đổi gói dịch vụ cho người dùng
            </p>
          </div>
          <button 
            className="modal-close" 
            onClick={onClose} 
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#6b7280',
              padding: '8px',
              borderRadius: '6px',
              opacity: loading ? 0.5 : 1
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="subscription-form" style={{ padding: '24px' }}>
          <div className="form-field">
            <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              Người dùng:
            </label>
            <div className="user-info-display" style={{
              background: '#f9fafb',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <strong style={{ fontSize: '15px' }}>{user.fullName || 'Chưa có tên'}</strong>
                <span className="email-text" style={{ fontSize: '14px', color: '#6b7280' }}>
                  <i className="fas fa-envelope" style={{ marginRight: '6px' }}></i>
                  {user.email}
                </span>
              </div>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="package-type" style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              Gói dịch vụ:
            </label>
            <select
              id="package-type"
              value={packageType}
              onChange={(e) => setPackageType(e.target.value)}
              className="form-control"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            >
              <option value="">Không có gói</option>
              <option value="SILVER">🥈 Gói Bạc</option>
              <option value="GOLD">🥇 Gói Vàng</option>
              <option value="PLATINUM">💎 Gói Bạch Kim</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="expires-at" style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              Ngày hết hạn:
            </label>
            <input
              id="expires-at"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="form-control"
              disabled={loading || !packageType}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            />
            <p className="form-caption" style={{ 
              marginTop: '6px', 
              fontSize: '13px', 
              color: '#6b7280',
              fontStyle: 'italic' 
            }}>
              💡 Để trống sẽ tự động set 30 ngày từ hiện tại
            </p>
          </div>

          <div className="form-actions" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            {user.subscriptionPackage && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#fee2e2',
                  color: '#dc2626',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <i className="fas fa-trash"></i>
                Xóa gói
              </button>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#f3f4f6',
                  color: '#374151',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: loading ? '#9ca3af' : '#8b5cf6',
                  color: 'white',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// User Detail Modal Component
const UserDetailModal = ({ user, onClose }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Hoạt động', color: '#10b981', bg: '#d1fae5' },
      inactive: { label: 'Không hoạt động', color: '#6b7280', bg: '#f3f4f6' },
      locked: { label: 'Đã khóa', color: '#ef4444', bg: '#fee2e2' },
      pending: { label: 'Chờ xác thực', color: '#f59e0b', bg: '#fef3c7' },
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (userType) => {
    const typeConfig = {
      driver: { label: 'Tài xế', color: '#3b82f6', bg: '#dbeafe' },
      staff: { label: 'Nhân viên', color: '#8b5cf6', bg: '#ede9fe' },
      admin: { label: 'Quản trị viên', color: '#ef4444', bg: '#fee2e2' },
    };
    const config = typeConfig[userType] || typeConfig.driver;
    return (
      <span className="type-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chi tiết người dùng</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="user-detail-info">
            <div className="info-row">
              <span className="info-label">ID:</span>
              <span className="info-value">#{user.userId || user.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Họ và tên:</span>
              <span className="info-value">{user.fullName || 'Chưa có tên'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Số điện thoại:</span>
              <span className="info-value">{user.phone || 'Chưa cập nhật'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Loại người dùng:</span>
              {getTypeBadge(user.userType)}
            </div>
            <div className="info-row">
              <span className="info-label">Trạng thái:</span>
              {getStatusBadge(user.status)}
            </div>
            <div className="info-row">
              <span className="info-label">Ngày tạo:</span>
              <span className="info-value">{formatDate(user.createdAt)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Cập nhật lần cuối:</span>
              <span className="info-value">{formatDate(user.updatedAt)}</span>
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

// ==========================================
// Edit User Modal - REBUILT
// ==========================================
const EditUserModal = ({ user, formData, setFormData, onClose, onSubmit, loading }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!user) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="modal-content modal-edit-user" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '600px' }}
      >
        <div className="modal-header">
          <div>
            <h3>
              <i className="fas fa-user-edit" style={{ marginRight: '10px', color: '#3b82f6' }}></i>
              Chỉnh sửa người dùng
            </h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              Cập nhật thông tin người dùng
            </p>
          </div>
          <button 
            className="modal-close" 
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: '#6b7280',
              padding: '8px',
              borderRadius: '6px',
              opacity: loading ? 0.5 : 1
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={onSubmit} className="edit-user-form" style={{ padding: '24px' }}>
          <div className="form-field" style={{ marginBottom: '20px' }}>
            <label htmlFor="edit-fullName" style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              Họ và tên <span className="required" style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="edit-fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="form-control"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="form-field" style={{ marginBottom: '20px' }}>
            <label htmlFor="edit-email" style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              Email
            </label>
            <input
              id="edit-email"
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="form-control form-control-disabled"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                background: '#f9fafb',
                color: '#6b7280',
                cursor: 'not-allowed'
              }}
            />
            <p className="form-caption" style={{ 
              marginTop: '6px', 
              fontSize: '13px', 
              color: '#9ca3af',
              fontStyle: 'italic' 
            }}>
              🔒 Email không thể thay đổi
            </p>
          </div>

          <div className="form-field" style={{ marginBottom: '20px' }}>
            <label htmlFor="edit-phone" style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              Số điện thoại
            </label>
            <input
              id="edit-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-control"
              disabled={loading}
              placeholder="0912345678"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            />
          </div>

          <div className="form-field" style={{ marginBottom: '20px' }}>
            <label htmlFor="edit-userType" style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>
              Loại người dùng
            </label>
            <select
              id="edit-userType"
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="form-control"
              disabled={loading || user.userType === 'admin'}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                background: (loading || user.userType === 'admin') ? '#f9fafb' : 'white',
                cursor: (loading || user.userType === 'admin') ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="driver">👤 Tài xế</option>
              <option value="staff">👨‍💼 Nhân viên</option>
              {user.userType === 'admin' && <option value="admin">👑 Quản trị viên</option>}
            </select>
            {user.userType === 'admin' && (
              <p className="form-caption" style={{ 
                marginTop: '6px', 
                fontSize: '13px', 
                color: '#9ca3af',
                fontStyle: 'italic' 
              }}>
                🔒 Không thể thay đổi loại của quản trị viên
              </p>
            )}
          </div>

          <div className="form-actions" style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: '#f3f4f6',
                color: '#374151',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: loading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Đang lưu...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create User Modal Component
const CreateUserModal = ({ onClose, onSuccess, loading: parentLoading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    userType: 'staff', // Default là staff cho nhân viên
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(''); // Clear general error
    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'email':
        if (!value) {
          error = 'Email là bắt buộc';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Email không hợp lệ';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Mật khẩu là bắt buộc';
        } else if (value.length < 6) {
          error = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Vui lòng xác nhận mật khẩu';
        } else if (value !== formData.password) {
          error = 'Mật khẩu xác nhận không khớp';
        }
        break;
      case 'fullName':
        if (!value || value.trim().length === 0) {
          error = 'Họ và tên là bắt buộc';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFieldErrors({ ...fieldErrors, [name]: error });
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      if (key === 'phone') return; // Phone is optional
      const error = validateField(key, formData[key]);
      if (error) {
        errors[key] = error;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return null;
    if (password.length < 6) return { level: 'weak', label: 'Yếu', color: '#ef4444' };
    if (password.length < 8) return { level: 'medium', label: 'Trung bình', color: '#f59e0b' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { level: 'medium', label: 'Trung bình', color: '#f59e0b' };
    }
    return { level: 'strong', label: 'Mạnh', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      setError('Vui lòng kiểm tra lại các trường đã nhập');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/users/register', {
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim() || null,
        userType: formData.userType,
      });

      console.log('✅ User created successfully:', response.data);
      alert(`Đã tạo ${formData.userType === 'staff' ? 'nhân viên' : 'người dùng'} thành công!`);
      onSuccess();
    } catch (err) {
      console.error('❌ Failed to create user:', err);
      const errorMessage = err.response?.data?.message || 
                          (err.response?.status === 400 ? 'Email đã tồn tại hoặc dữ liệu không hợp lệ' : 
                           err.message || 'Không thể tạo người dùng. Vui lòng thử lại.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || parentLoading;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-create-user" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <div>
              <h3>Thêm người dùng mới</h3>
              <p className="modal-subtitle">Tạo tài khoản mới cho nhân viên hoặc tài xế</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-user-form">
          {error && (
            <div className="form-error-banner">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Account Information Section */}
          <div className="form-section">
            <div className="form-section-header">
              <i className="fas fa-user-circle"></i>
              <h4>Thông tin tài khoản</h4>
            </div>
            
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="create-email">
                  <i className="fas fa-envelope"></i>
                  Email <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    id="create-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`form-control ${fieldErrors.email ? 'error' : ''}`}
                    disabled={isLoading}
                    placeholder="nhanvien@evcharge.vn"
                  />
                  {fieldErrors.email && (
                    <span className="field-error">
                      <i className="fas fa-exclamation-circle"></i>
                      {fieldErrors.email}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="create-userType">
                  <i className="fas fa-users"></i>
                  Loại người dùng <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <select
                    id="create-userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    className="form-control"
                    disabled={isLoading}
                    required
                  >
                    <option value="staff">Nhân viên</option>
                    <option value="driver">Tài xế</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="create-password">
                  <i className="fas fa-lock"></i>
                  Mật khẩu <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    id="create-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    minLength={6}
                    className={`form-control ${fieldErrors.password ? 'error' : ''}`}
                    disabled={isLoading}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  {passwordStrength && (
                    <div className="password-strength">
                      <div className="password-strength-bar">
                        <div
                          className={`password-strength-fill ${passwordStrength.level}`}
                          style={{ backgroundColor: passwordStrength.color }}
                        ></div>
                      </div>
                      <span className="password-strength-label" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                  {fieldErrors.password && (
                    <span className="field-error">
                      <i className="fas fa-exclamation-circle"></i>
                      {fieldErrors.password}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="create-confirmPassword">
                  <i className="fas fa-lock"></i>
                  Xác nhận mật khẩu <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    id="create-confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    minLength={6}
                    className={`form-control ${fieldErrors.confirmPassword ? 'error' : ''}`}
                    disabled={isLoading}
                    placeholder="Nhập lại mật khẩu"
                  />
                  {fieldErrors.confirmPassword && (
                    <span className="field-error">
                      <i className="fas fa-exclamation-circle"></i>
                      {fieldErrors.confirmPassword}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="form-section">
            <div className="form-section-header">
              <i className="fas fa-id-card"></i>
              <h4>Thông tin cá nhân</h4>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="create-fullName">
                  <i className="fas fa-user"></i>
                  Họ và tên <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    id="create-fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`form-control ${fieldErrors.fullName ? 'error' : ''}`}
                    disabled={isLoading}
                    placeholder="Ví dụ: Nguyễn Văn A"
                  />
                  {fieldErrors.fullName && (
                    <span className="field-error">
                      <i className="fas fa-exclamation-circle"></i>
                      {fieldErrors.fullName}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="create-phone">
                  <i className="fas fa-phone"></i>
                  Số điện thoại
                </label>
                <div className="input-wrapper">
                  <input
                    id="create-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control"
                    disabled={isLoading}
                    placeholder="0912345678"
                  />
                  <p className="form-caption">Tùy chọn - Có thể cập nhật sau</p>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              <i className="fas fa-times"></i>
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-small"></span>
                  Đang tạo...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  Tạo người dùng
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsersManagement;