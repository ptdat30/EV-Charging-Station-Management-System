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

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');


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
      
      // ⚠️ NOTE: Package service không có trong backend hiện tại
      // Đang sử dụng mock data cho mục đích demo/development
      // TODO: Khi backend package service được implement, thay thế bằng:
      // const response = await getAllPackages();
      // const data = response.data || response || [];
      // setPackages(Array.isArray(data) ? data : []);
      
      // Cố định 3 gói dịch vụ: Bạc, Vàng, Bạch Kim
      const mockPackages = [
        {
          id: 1,
          name: 'Gói Bạc',
          description: 'Gói dịch vụ cơ bản cho driver',
          type: 'SILVER',
          price: 299000,
          durationDays: 30,
          features: ['Sạc không giới hạn trong 30 ngày', 'Tiết kiệm 25%', 'Ưu tiên booking', 'Hỗ trợ email 48h'],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Gói Vàng',
          description: 'Gói dịch vụ nâng cao cho driver',
          type: 'GOLD',
          price: 599000,
          durationDays: 30,
          features: ['Sạc không giới hạn trong 30 ngày', 'Tiết kiệm 40%', 'Ưu tiên cao', 'Hỗ trợ chat 24/7', 'Báo cáo chi tiết'],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          name: 'Gói Bạch Kim',
          description: 'Gói dịch vụ cao cấp cho driver',
          type: 'PLATINUM',
          price: 999000,
          durationDays: 30,
          features: ['Sạc không giới hạn trong 30 ngày', 'Tiết kiệm 50%', 'Ưu tiên cao nhất', 'Hỗ trợ VIP 24/7', 'Báo cáo nâng cao'],
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
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner" style={{ 
        background: '#e0f2fe', 
        border: '1px solid #0ea5e9', 
        borderRadius: '0.5rem', 
        padding: '1rem', 
        marginBottom: '1.5rem',
        color: '#0c4a6e'
      }}>
        <i className="fas fa-info-circle"></i>
        <span style={{ marginLeft: '0.5rem' }}>
          Các gói dịch vụ đã được cố định: Bạc, Vàng, Bạch Kim. Admin không thể chỉnh sửa hoặc xóa các gói này.
          Vui lòng sử dụng chức năng quản lý user để kiểm soát user nào sử dụng gói dịch vụ nào.
        </span>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-value">{packages.length}</div>
          <div className="stat-label">Tổng số gói</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#c0c0c0' }}>
            {packages.filter(p => p.type === 'SILVER').length}
          </div>
          <div className="stat-label">Gói Bạc</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#ffd700' }}>
            {packages.filter(p => p.type === 'GOLD').length}
          </div>
          <div className="stat-label">Gói Vàng</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#e5e4e2' }}>
            {packages.filter(p => p.type === 'PLATINUM').length}
          </div>
          <div className="stat-label">Gói Bạch Kim</div>
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
          <option value="SILVER">Gói Bạc</option>
          <option value="GOLD">Gói Vàng</option>
          <option value="PLATINUM">Gói Bạch Kim</option>
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
                      <i className="fas fa-calendar"></i>
                      <span>{pkg.durationDays} ngày</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-tag"></i>
                      <span>Loại: {pkg.type}</span>
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

    </div>
  );
};

// Package Detail Modal Component
const PackageDetailModal = ({ package: pkg, onClose }) => {
  const getTypeBadge = (type) => {
    const typeConfig = {
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
              <span className="info-label">Loại gói:</span>
              <span className="info-value">{pkg.type}</span>
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


export default PackagesManagement;
