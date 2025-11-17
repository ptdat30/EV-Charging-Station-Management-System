// src/components/admin/PackagesManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getAllPackages, createPackage, updatePackage, deletePackage, togglePackageStatus } from '../../services/packageService';
import ConfirmationModal from '../ConfirmationModal';
import AlertModal from '../AlertModal';
import '../../styles/AdminPackagesManagement.css';

const PackagesManagement = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePackageId, setDeletePackageId] = useState(null);
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Form data
  const [formData, setFormData] = useState({
    packageName: '',
    description: '',
    packageType: 'PREPAID', // PREPAID, POSTPAID, VIP
    price: '',
    durationDays: 30,
    features: '',
    discountPercentage: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...packages];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pkg =>
        pkg.packageName?.toLowerCase().includes(query) ||
        pkg.description?.toLowerCase().includes(query) ||
        pkg.packageType?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.packageType === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pkg => 
        statusFilter === 'active' ? pkg.isActive : !pkg.isActive
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.packageName || '').localeCompare(b.packageName || '');
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'type':
          return (a.packageType || '').localeCompare(b.packageType || '');
        case 'created':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    setFilteredPackages(filtered);
  }, [packages, searchQuery, typeFilter, statusFilter, sortBy]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAllPackages();
      const data = response.data || response || [];
      
      const packagesArray = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      
      const transformedData = packagesArray.map(pkg => ({
        id: pkg.packageId || pkg.id,
        packageName: pkg.packageName || pkg.name,
        description: pkg.description || '',
        packageType: pkg.packageType || pkg.type,
        price: pkg.price || 0,
        durationDays: pkg.durationDays || pkg.duration || 30,
        features: Array.isArray(pkg.features) ? pkg.features : (pkg.features ? [pkg.features] : []),
        discountPercentage: pkg.discountPercentage || pkg.discount || 0,
        isActive: pkg.isActive !== undefined ? pkg.isActive : true,
        createdAt: pkg.createdAt,
        updatedAt: pkg.updatedAt
      }));
      
      setPackages(transformedData);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách gói dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = () => {
    setFormData({
      packageName: '',
      description: '',
      packageType: 'PREPAID',
      price: '',
      durationDays: 30,
      features: '',
      discountPercentage: 0,
      isActive: true,
    });
    setShowCreateModal(true);
  };

  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({
      packageName: pkg.packageName || '',
      description: pkg.description || '',
      packageType: pkg.packageType || 'PREPAID',
      price: pkg.price || 0,
      durationDays: pkg.durationDays || 30,
      features: Array.isArray(pkg.features) ? pkg.features.join('\n') : (pkg.features || ''),
      discountPercentage: pkg.discountPercentage || 0,
      isActive: pkg.isActive !== undefined ? pkg.isActive : true,
    });
    setShowEditModal(true);
  };

  const handleViewPackage = (pkg) => {
    setSelectedPackage(pkg);
    setShowDetailModal(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const packageData = {
        packageName: formData.packageName,
        description: formData.description,
        packageType: formData.packageType,
        price: parseFloat(formData.price) || 0,
        durationDays: parseInt(formData.durationDays) || 30,
        features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : [],
        discountPercentage: parseFloat(formData.discountPercentage) || 0,
        isActive: formData.isActive,
      };

      if (showEditModal && selectedPackage) {
        await updatePackage(selectedPackage.id, packageData);
        setAlertModal({
          isOpen: true,
          title: 'Thành công',
          message: 'Cập nhật gói dịch vụ thành công!',
          type: 'success'
        });
      } else {
        await createPackage(packageData);
        setAlertModal({
          isOpen: true,
          title: 'Thành công',
          message: 'Tạo gói dịch vụ thành công!',
          type: 'success'
        });
      }

      await fetchPackages();
      setShowCreateModal(false);
      setShowEditModal(false);
      setSelectedPackage(null);
      setFormData({
        packageName: '',
        description: '',
        packageType: 'PREPAID',
        price: '',
        durationDays: 30,
        features: '',
        discountPercentage: 0,
        isActive: true,
      });
    } catch (err) {
      console.error('Error saving package:', err);
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: err.response?.data?.message || 'Không thể lưu gói dịch vụ',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = (packageId) => {
    setDeletePackageId(packageId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletePackageId) return;
    const packageId = deletePackageId;
    setShowDeleteConfirm(false);
    setDeletePackageId(null);

    try {
      setLoading(true);
      await deletePackage(packageId);
      await fetchPackages();
      setAlertModal({
        isOpen: true,
        title: 'Thành công',
        message: 'Xóa gói dịch vụ thành công!',
        type: 'success'
      });
    } catch (err) {
      console.error('Error deleting package:', err);
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: err.response?.data?.message || 'Không thể xóa gói dịch vụ',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (packageId, currentStatus) => {
    try {
      setLoading(true);
      await togglePackageStatus(packageId, !currentStatus);
      await fetchPackages();
    } catch (err) {
      console.error('Error toggling package status:', err);
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: err.response?.data?.message || 'Không thể thay đổi trạng thái gói dịch vụ',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      PREPAID: { label: 'Trả trước', color: '#3b82f6', bg: '#dbeafe' },
      POSTPAID: { label: 'Trả sau', color: '#10b981', bg: '#d1fae5' },
      VIP: { label: 'VIP', color: '#f59e0b', bg: '#fef3c7' },
      SILVER: { label: 'Gói Bạc', color: '#64748b', bg: '#f1f5f9' },
      GOLD: { label: 'Gói Vàng', color: '#f59e0b', bg: '#fef3c7' },
      PLATINUM: { label: 'Gói Bạch Kim', color: '#e5e4e2', bg: '#f8fafc' },
    };
    const config = typeConfig[type] || { label: type, color: '#64748b', bg: '#f1f5f9' };
    return (
      <span className="type-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const formatPrice = (price) => {
    if (price === 0 || price === null) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  if (loading && packages.length === 0) {
    return (
      <div className="packages-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách gói dịch vụ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="packages-management">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Quản lý Gói Cước</h2>
          <p>Tạo và chỉnh sửa các gói thuê bao (trả trước, trả sau, VIP)</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchPackages}>
            <i className="fas fa-refresh"></i>
            Làm mới
          </button>
          <button className="btn-primary" onClick={handleCreatePackage}>
            <i className="fas fa-plus"></i>
            Tạo gói mới
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-value">{packages.length}</div>
          <div className="stat-label">Tổng số gói</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {packages.filter(p => p.packageType === 'PREPAID').length}
          </div>
          <div className="stat-label">Trả trước</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#10b981' }}>
            {packages.filter(p => p.packageType === 'POSTPAID').length}
          </div>
          <div className="stat-label">Trả sau</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {packages.filter(p => p.packageType === 'VIP').length}
          </div>
          <div className="stat-label">VIP</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#10b981' }}>
            {packages.filter(p => p.isActive).length}
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
            placeholder="Tìm kiếm theo tên, mô tả..."
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
          <option value="PREPAID">Trả trước</option>
          <option value="POSTPAID">Trả sau</option>
          <option value="VIP">VIP</option>
        </select>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang kích hoạt</option>
          <option value="inactive">Vô hiệu hóa</option>
        </select>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sắp xếp theo tên</option>
          <option value="price">Sắp xếp theo giá</option>
          <option value="type">Sắp xếp theo loại</option>
          <option value="created">Mới nhất</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchPackages}>
            Thử lại
          </button>
        </div>
      )}

      {/* Packages Table */}
      {!error && (
        <div className="packages-table-container">
          <table className="packages-table">
            <thead>
              <tr>
                <th>Tên gói</th>
                <th>Loại</th>
                <th>Mô tả</th>
                <th>Giá</th>
                <th>Thời hạn</th>
                <th>Giảm giá</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data-cell">
                    <i className="fas fa-inbox"></i>
                    <p>Không tìm thấy gói dịch vụ nào</p>
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => (
                  <tr key={pkg.id}>
                    <td>
                      <strong>{pkg.packageName || 'Chưa có tên'}</strong>
                    </td>
                    <td>{getTypeBadge(pkg.packageType)}</td>
                    <td>
                      <span className="description-text" title={pkg.description}>
                        {pkg.description ? (pkg.description.length > 50 ? pkg.description.substring(0, 50) + '...' : pkg.description) : '-'}
                      </span>
                    </td>
                    <td>
                      <span className="price-text">{formatPrice(pkg.price)}</span>
                    </td>
                    <td>
                      <span>{pkg.durationDays} ngày</span>
                    </td>
                    <td>
                      <span>{pkg.discountPercentage}%</span>
                    </td>
                    <td>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={pkg.isActive}
                          onChange={() => handleToggleStatus(pkg.id, pkg.isActive)}
                          disabled={loading}
                        />
                        <span className="toggle-label">{pkg.isActive ? 'Hoạt động' : 'Vô hiệu'}</span>
                      </label>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewPackage(pkg)}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEditPackage(pkg)}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDeletePackage(pkg.id)}
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

      {/* Create/Edit Package Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal-overlay" onClick={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedPackage(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>
                <i className={`fas ${showEditModal ? 'fa-edit' : 'fa-plus'}`} style={{ marginRight: '10px', color: showEditModal ? '#3b82f6' : '#10b981' }}></i>
                {showEditModal ? 'Chỉnh sửa Gói Cước' : 'Tạo Gói Cước Mới'}
              </h3>
              <button className="modal-close" onClick={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedPackage(null); }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSavePackage} className="modal-body">
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Tên gói <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.packageName}
                  onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                  required
                  placeholder="Ví dụ: Gói Trả Trước Cơ Bản"
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Loại gói <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={formData.packageType}
                  onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                >
                  <option value="PREPAID">Trả trước</option>
                  <option value="POSTPAID">Trả sau</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Mô tả về gói dịch vụ..."
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Giá (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                    placeholder="299000"
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Thời hạn (ngày) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                    required
                    min="1"
                    placeholder="30"
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Tính năng (mỗi dòng một tính năng)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={4}
                  placeholder="Tính năng 1&#10;Tính năng 2&#10;Tính năng 3"
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Giảm giá (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                    min="0"
                    max="100"
                    placeholder="0"
                    style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Trạng thái
                  </label>
                  <label className="toggle-switch" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span className="toggle-label">{formData.isActive ? 'Hoạt động' : 'Vô hiệu'}</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setShowCreateModal(false); setShowEditModal(false); setSelectedPackage(null); }}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> {showEditModal ? 'Cập nhật' : 'Tạo gói'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Detail Modal */}
      {showDetailModal && selectedPackage && (
        <div className="modal-overlay" onClick={() => { setShowDetailModal(false); setSelectedPackage(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-box" style={{ marginRight: '10px', color: '#8b5cf6' }}></i>
                Chi tiết Gói Cước
              </h3>
              <button className="modal-close" onClick={() => { setShowDetailModal(false); setSelectedPackage(null); }}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Tên gói:</strong>
                  <p style={{ marginTop: '5px', color: '#6b7280' }}>{selectedPackage.packageName}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Loại:</strong>
                  <div style={{ marginTop: '5px' }}>{getTypeBadge(selectedPackage.packageType)}</div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Mô tả:</strong>
                  <p style={{ marginTop: '5px', color: '#6b7280' }}>{selectedPackage.description || 'Chưa có mô tả'}</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Giá:</strong>
                  <p style={{ marginTop: '5px', fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                    {formatPrice(selectedPackage.price)}
                  </p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Thời hạn:</strong>
                  <p style={{ marginTop: '5px', color: '#6b7280' }}>{selectedPackage.durationDays} ngày</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Giảm giá:</strong>
                  <p style={{ marginTop: '5px', color: '#6b7280' }}>{selectedPackage.discountPercentage}%</p>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Trạng thái:</strong>
                  <p style={{ marginTop: '5px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '6px', 
                      fontSize: '14px',
                      fontWeight: '600',
                      color: selectedPackage.isActive ? '#10b981' : '#6b7280',
                      background: selectedPackage.isActive ? '#d1fae5' : '#f3f4f6'
                    }}>
                      {selectedPackage.isActive ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </p>
                </div>
                {selectedPackage.features && selectedPackage.features.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Tính năng:</strong>
                    <ul style={{ marginTop: '10px', paddingLeft: '20px', color: '#6b7280' }}>
                      {Array.isArray(selectedPackage.features) ? (
                        selectedPackage.features.map((feature, idx) => (
                          <li key={idx} style={{ marginBottom: '5px' }}>
                            <i className="fas fa-check" style={{ color: '#10b981', marginRight: '8px' }}></i>
                            {feature}
                          </li>
                        ))
                      ) : (
                        <li>{selectedPackage.features}</li>
                      )}
                    </ul>
                  </div>
                )}
                <div style={{ marginBottom: '15px' }}>
                  <strong>Ngày tạo:</strong>
                  <p style={{ marginTop: '5px', color: '#6b7280' }}>{formatDate(selectedPackage.createdAt)}</p>
                </div>
                {selectedPackage.updatedAt && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Cập nhật lần cuối:</strong>
                    <p style={{ marginTop: '5px', color: '#6b7280' }}>{formatDate(selectedPackage.updatedAt)}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => { setShowDetailModal(false); setSelectedPackage(null); }}>
                Đóng
              </button>
              <button className="btn-primary" onClick={() => {
                setShowDetailModal(false);
                handleEditPackage(selectedPackage);
              }}>
                <i className="fas fa-edit"></i> Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Package Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletePackageId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa gói dịch vụ"
        message="Bạn có chắc chắn muốn xóa gói dịch vụ này?"
        confirmText="Xác nhận"
        cancelText="Hủy"
        type="warning"
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

export default PackagesManagement;
