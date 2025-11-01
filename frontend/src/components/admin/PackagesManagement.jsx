// src/components/admin/PackagesManagement.jsx
import React, { useState, useEffect } from 'react';
import { getAllPackages, deletePackage, togglePackageStatus } from '../../services/packageService';
import apiClient from '../../config/api';
import '../../styles/AdminPackagesManagement.css';

const PackagesManagement = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Edit form
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    type: 'prepaid',
    price: '',
    durationDays: '',
    features: '',
    maxChargers: '',
    isActive: true,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [packages, searchQuery, typeFilter, statusFilter, sortBy]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, use mock data until backend is ready
      const mockPackages = [
        {
          id: 1,
          name: 'Gói Cơ bản',
          description: 'Phù hợp cho trạm nhỏ, mới bắt đầu',
          type: 'prepaid',
          price: 299000,
          durationDays: 30,
          features: ['Tối đa 5 cổng sạc', 'Báo cáo cơ bản', 'Hỗ trợ email 48h'],
          maxChargers: 5,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Gói Chuyên nghiệp',
          description: 'Dành cho hệ thống trung bình, nhiều trạm',
          type: 'postpaid',
          price: 799000,
          durationDays: 30,
          features: ['Tối đa 20 cổng sạc', 'Báo cáo nâng cao', 'Hỗ trợ 24/7'],
          maxChargers: 20,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          name: 'Gói VIP',
          description: 'Giải pháp toàn diện cho chuỗi trạm lớn',
          type: 'vip',
          price: 0,
          durationDays: 365,
          features: ['Không giới hạn cổng sạc', 'Dashboard quản trị', 'Hỗ trợ VIP 24/7'],
          maxChargers: -1, // -1 means unlimited
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
      setPackages(mockPackages);
      
      // Uncomment when backend is ready:
      // const response = await getAllPackages();
      // const data = response.data || response || [];
      // setPackages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('Không thể tải danh sách gói dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...packages];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pkg =>
        pkg.name?.toLowerCase().includes(query) ||
        pkg.description?.toLowerCase().includes(query) ||
        pkg.type?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(pkg => pkg.type === typeFilter);
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
          return (a.name || '').localeCompare(b.name || '');
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredPackages(filtered);
  };

  const handleViewPackage = (pkg) => {
    setSelectedPackage(pkg);
    setShowModal(true);
  };

  const handleEditPackage = (pkg) => {
    setSelectedPackage(pkg);
    setEditForm({
      name: pkg.name || '',
      description: pkg.description || '',
      type: pkg.type || 'prepaid',
      price: pkg.price || '',
      durationDays: pkg.durationDays || '',
      features: Array.isArray(pkg.features) ? pkg.features.join('\n') : (pkg.features || ''),
      maxChargers: pkg.maxChargers === -1 ? '' : (pkg.maxChargers || ''),
      isActive: pkg.isActive !== undefined ? pkg.isActive : true,
    });
    setShowEditModal(true);
  };

  const handleUpdatePackage = async (e) => {
    e.preventDefault();
    if (!selectedPackage) return;

    try {
      setLoading(true);
      const featuresArray = editForm.features.split('\n').filter(f => f.trim());
      await apiClient.put(`/packages/${selectedPackage.id}`, {
        name: editForm.name,
        description: editForm.description,
        type: editForm.type,
        price: parseFloat(editForm.price) || 0,
        durationDays: parseInt(editForm.durationDays) || 30,
        features: featuresArray,
        maxChargers: editForm.maxChargers === '' ? -1 : parseInt(editForm.maxChargers) || -1,
        isActive: editForm.isActive,
      });
      await fetchPackages();
      setShowEditModal(false);
      setSelectedPackage(null);
      alert('Cập nhật gói dịch vụ thành công!');
    } catch (err) {
      console.error('Error updating package:', err);
      alert(err.response?.data?.message || 'Không thể cập nhật gói dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này?')) {
      return;
    }

    try {
      setLoading(true);
      await deletePackage(packageId);
      await fetchPackages();
      if (selectedPackage?.id === packageId) {
        setShowModal(false);
        setSelectedPackage(null);
      }
      alert('Xóa gói dịch vụ thành công!');
    } catch (err) {
      console.error('Error deleting package:', err);
      alert(err.response?.data?.message || 'Không thể xóa gói dịch vụ');
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
      alert(err.response?.data?.message || 'Không thể thay đổi trạng thái gói dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      prepaid: { label: 'Trả trước', color: '#3b82f6', bg: '#dbeafe' },
      postpaid: { label: 'Trả sau', color: '#8b5cf6', bg: '#ede9fe' },
      vip: { label: 'VIP', color: '#f59e0b', bg: '#fef3c7' },
    };
    const config = typeConfig[type] || typeConfig.prepaid;
    return (
      <span className="type-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const formatPrice = (price) => {
    if (price === 0 || price === null) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
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
          <h2>Quản lý Gói Dịch vụ</h2>
          <p>Theo dõi và quản lý các gói dịch vụ trong hệ thống</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchPackages}>
            <i className="fas fa-refresh"></i>
            Làm mới
          </button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <i className="fas fa-plus"></i>
            Thêm gói mới
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
            {packages.filter(p => p.type === 'prepaid').length}
          </div>
          <div className="stat-label">Trả trước</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#8b5cf6' }}>
            {packages.filter(p => p.type === 'postpaid').length}
          </div>
          <div className="stat-label">Trả sau</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#10b981' }}>
            {packages.filter(p => p.isActive).length}
          </div>
          <div className="stat-label">Đang kích hoạt</div>
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
          <option value="prepaid">Trả trước</option>
          <option value="postpaid">Trả sau</option>
          <option value="vip">VIP</option>
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

      {/* Packages Grid */}
      {!error && (
        <div className="packages-grid">
          {filteredPackages.length === 0 ? (
            <div className="no-data-container">
              <i className="fas fa-inbox"></i>
              <p>Không tìm thấy gói dịch vụ nào</p>
            </div>
          ) : (
            filteredPackages.map((pkg) => (
              <div key={pkg.id} className={`package-card ${!pkg.isActive ? 'inactive' : ''}`}>
                <div className="package-card-header">
                  <div className="package-card-title">
                    <h3>{pkg.name}</h3>
                    {getTypeBadge(pkg.type)}
                  </div>
                  <div className="package-status-toggle">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={pkg.isActive}
                        onChange={() => handleToggleStatus(pkg.id, pkg.isActive)}
                        disabled={loading}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="package-card-body">
                  <p className="package-description">{pkg.description}</p>
                  
                  <div className="package-price">
                    <span className="price-amount">{formatPrice(pkg.price)}</span>
                    {pkg.price > 0 && (
                      <span className="price-period">/{pkg.durationDays} ngày</span>
                    )}
                  </div>

                  <div className="package-features">
                    <h4>Tính năng:</h4>
                    <ul>
                      {Array.isArray(pkg.features) ? (
                        pkg.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx}>
                            <i className="fas fa-check"></i>
                            {feature}
                          </li>
                        ))
                      ) : (
                        <li>
                          <i className="fas fa-check"></i>
                          {pkg.features || 'Không có tính năng'}
                        </li>
                      )}
                      {Array.isArray(pkg.features) && pkg.features.length > 3 && (
                        <li className="more-features">
                          +{pkg.features.length - 3} tính năng khác
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="package-info">
                    <div className="info-item">
                      <i className="fas fa-plug"></i>
                      <span>
                        {pkg.maxChargers === -1 ? 'Không giới hạn' : `Tối đa ${pkg.maxChargers} cổng`}
                      </span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-calendar"></i>
                      <span>{pkg.durationDays} ngày</span>
                    </div>
                  </div>
                </div>

                <div className="package-card-actions">
                  <button
                    className="btn-action btn-view"
                    onClick={() => handleViewPackage(pkg)}
                    title="Xem chi tiết"
                  >
                    <i className="fas fa-eye"></i>
                    Chi tiết
                  </button>
                  <button
                    className="btn-action btn-edit"
                    onClick={() => handleEditPackage(pkg)}
                    title="Chỉnh sửa"
                  >
                    <i className="fas fa-edit"></i>
                    Sửa
                  </button>
                  <button
                    className="btn-action btn-delete"
                    onClick={() => handleDeletePackage(pkg.id)}
                    title="Xóa"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Package Detail Modal */}
      {showModal && selectedPackage && (
        <PackageDetailModal
          package={selectedPackage}
          onClose={() => {
            setShowModal(false);
            setSelectedPackage(null);
          }}
        />
      )}

      {/* Edit Package Modal */}
      {showEditModal && selectedPackage && (
        <EditPackageModal
          package={selectedPackage}
          formData={editForm}
          setFormData={setEditForm}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPackage(null);
            setEditForm({
              name: '',
              description: '',
              type: 'prepaid',
              price: '',
              durationDays: '',
              features: '',
              maxChargers: '',
              isActive: true,
            });
          }}
          onSubmit={handleUpdatePackage}
          loading={loading}
        />
      )}

      {/* Create Package Modal */}
      {showCreateModal && (
        <CreatePackageModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={async () => {
            setShowCreateModal(false);
            await fetchPackages();
          }}
          loading={loading}
        />
      )}
    </div>
  );
};

// Package Detail Modal Component
const PackageDetailModal = ({ package: pkg, onClose }) => {
  const getTypeBadge = (type) => {
    const typeConfig = {
      prepaid: { label: 'Trả trước', color: '#3b82f6', bg: '#dbeafe' },
      postpaid: { label: 'Trả sau', color: '#8b5cf6', bg: '#ede9fe' },
      vip: { label: 'VIP', color: '#f59e0b', bg: '#fef3c7' },
    };
    const config = typeConfig[type] || typeConfig.prepaid;
    return (
      <span className="type-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const formatPrice = (price) => {
    if (price === 0 || price === null) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chi tiết gói dịch vụ</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="package-detail-info">
            <div className="info-row">
              <span className="info-label">Tên gói:</span>
              <span className="info-value">{pkg.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Loại:</span>
              {getTypeBadge(pkg.type)}
            </div>
            <div className="info-row">
              <span className="info-label">Mô tả:</span>
              <span className="info-value">{pkg.description}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Giá:</span>
              <span className="info-value price-value">{formatPrice(pkg.price)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Thời hạn:</span>
              <span className="info-value">{pkg.durationDays} ngày</span>
            </div>
            <div className="info-row">
              <span className="info-label">Số cổng tối đa:</span>
              <span className="info-value">
                {pkg.maxChargers === -1 ? 'Không giới hạn' : `${pkg.maxChargers} cổng`}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Trạng thái:</span>
              <span className={`info-value ${pkg.isActive ? 'status-active' : 'status-inactive'}`}>
                {pkg.isActive ? 'Đang kích hoạt' : 'Vô hiệu hóa'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Tính năng:</span>
              <div className="info-value">
                <ul className="features-list">
                  {Array.isArray(pkg.features) ? (
                    pkg.features.map((feature, idx) => (
                      <li key={idx}>
                        <i className="fas fa-check"></i>
                        {feature}
                      </li>
                    ))
                  ) : (
                    <li>{pkg.features || 'Không có tính năng'}</li>
                  )}
                </ul>
              </div>
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

// Edit Package Modal Component
const EditPackageModal = ({ package: pkg, formData, setFormData, onClose, onSubmit, loading }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Chỉnh sửa gói dịch vụ</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={onSubmit} className="edit-package-form">
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="edit-name">
                Tên gói <span className="required">*</span>
              </label>
              <input
                id="edit-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-control"
                disabled={loading}
                placeholder="Ví dụ: Gói Cơ bản"
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-type">
                Loại <span className="required">*</span>
              </label>
              <select
                id="edit-type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-control"
                disabled={loading}
                required
              >
                <option value="prepaid">Trả trước</option>
                <option value="postpaid">Trả sau</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="edit-description">Mô tả</label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              disabled={loading}
              rows={3}
              placeholder="Mô tả về gói dịch vụ"
            />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="edit-price">Giá (₫)</label>
              <input
                id="edit-price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-control"
                disabled={loading}
                min="0"
                placeholder="299000"
              />
              <p className="form-caption">Để 0 hoặc trống cho gói VIP (liên hệ)</p>
            </div>

            <div className="form-field">
              <label htmlFor="edit-durationDays">
                Thời hạn (ngày) <span className="required">*</span>
              </label>
              <input
                id="edit-durationDays"
                type="number"
                name="durationDays"
                value={formData.durationDays}
                onChange={handleChange}
                required
                className="form-control"
                disabled={loading}
                min="1"
                placeholder="30"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="edit-maxChargers">Số cổng tối đa</label>
              <input
                id="edit-maxChargers"
                type="number"
                name="maxChargers"
                value={formData.maxChargers}
                onChange={handleChange}
                className="form-control"
                disabled={loading}
                min="-1"
                placeholder="5"
              />
              <p className="form-caption">Để trống hoặc -1 cho không giới hạn</p>
            </div>

            <div className="form-field">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  disabled={loading}
                />
                <span style={{ marginLeft: '8px' }}>Đang kích hoạt</span>
              </label>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="edit-features">Tính năng (mỗi dòng một tính năng)</label>
            <textarea
              id="edit-features"
              name="features"
              value={formData.features}
              onChange={handleChange}
              className="form-control"
              disabled={loading}
              rows={5}
              placeholder="Tối đa 5 cổng sạc&#10;Báo cáo cơ bản&#10;Hỗ trợ email 48h"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
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

// Create Package Modal Component (similar structure, will implement)
const CreatePackageModal = ({ onClose, onSuccess, loading: parentLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'prepaid',
    price: '',
    durationDays: '30',
    features: '',
    maxChargers: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const featuresArray = formData.features.split('\n').filter(f => f.trim());
      await apiClient.post('/packages', {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        price: parseFloat(formData.price) || 0,
        durationDays: parseInt(formData.durationDays) || 30,
        features: featuresArray,
        maxChargers: formData.maxChargers === '' ? -1 : parseInt(formData.maxChargers) || -1,
        isActive: formData.isActive,
      });

      alert('Tạo gói dịch vụ thành công!');
      onSuccess();
    } catch (err) {
      console.error('Error creating package:', err);
      setError(err.response?.data?.message || 'Không thể tạo gói dịch vụ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || parentLoading;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Thêm gói dịch vụ mới</h3>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="edit-package-form">
          {error && (
            <div className="form-error-banner">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="create-name">
                Tên gói <span className="required">*</span>
              </label>
              <input
                id="create-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-control"
                disabled={isLoading}
                placeholder="Ví dụ: Gói Cơ bản"
              />
            </div>

            <div className="form-field">
              <label htmlFor="create-type">
                Loại <span className="required">*</span>
              </label>
              <select
                id="create-type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-control"
                disabled={isLoading}
                required
              >
                <option value="prepaid">Trả trước</option>
                <option value="postpaid">Trả sau</option>
                <option value="vip">VIP</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="create-description">Mô tả</label>
            <textarea
              id="create-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              disabled={isLoading}
              rows={3}
              placeholder="Mô tả về gói dịch vụ"
            />
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="create-price">Giá (₫)</label>
              <input
                id="create-price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-control"
                disabled={isLoading}
                min="0"
                placeholder="299000"
              />
              <p className="form-caption">Để 0 hoặc trống cho gói VIP (liên hệ)</p>
            </div>

            <div className="form-field">
              <label htmlFor="create-durationDays">
                Thời hạn (ngày) <span className="required">*</span>
              </label>
              <input
                id="create-durationDays"
                type="number"
                name="durationDays"
                value={formData.durationDays}
                onChange={handleChange}
                required
                className="form-control"
                disabled={isLoading}
                min="1"
                placeholder="30"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="create-maxChargers">Số cổng tối đa</label>
              <input
                id="create-maxChargers"
                type="number"
                name="maxChargers"
                value={formData.maxChargers}
                onChange={handleChange}
                className="form-control"
                disabled={isLoading}
                min="-1"
                placeholder="5"
              />
              <p className="form-caption">Để trống hoặc -1 cho không giới hạn</p>
            </div>

            <div className="form-field">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <span style={{ marginLeft: '8px' }}>Kích hoạt ngay</span>
              </label>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="create-features">Tính năng (mỗi dòng một tính năng)</label>
            <textarea
              id="create-features"
              name="features"
              value={formData.features}
              onChange={handleChange}
              className="form-control"
              disabled={isLoading}
              rows={5}
              placeholder="Tối đa 5 cổng sạc&#10;Báo cáo cơ bản&#10;Hỗ trợ email 48h"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
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
                  Tạo gói dịch vụ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackagesManagement;
