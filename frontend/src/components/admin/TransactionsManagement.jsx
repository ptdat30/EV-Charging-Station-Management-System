// src/components/admin/TransactionsManagement.jsx
import React, { useState, useEffect } from 'react';
import { getAllTransactions } from '../../services/adminService';
import apiClient from '../../config/api';
import '../../styles/AdminTransactionsManagement.css';

const TransactionsManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchQuery, statusFilter, typeFilter, dateFilter, sortBy, currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch payments and users in parallel
      const [paymentsResponse, usersResponse] = await Promise.all([
        getAllTransactions().catch(err => {
          console.error('Error fetching payments:', err);
          return { data: { content: [], totalElements: 0 } };
        }),
        apiClient.get('/users/getall').catch(() => ({ data: [] })),
      ]);

      // Extract payments from response (can be page or array)
      let paymentsList = [];
      if (paymentsResponse.data?.content) {
        paymentsList = paymentsResponse.data.content;
      } else if (Array.isArray(paymentsResponse.data)) {
        paymentsList = paymentsResponse.data;
      } else {
        paymentsList = [];
      }

      // Get users map for userName lookup
      const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
      const usersMap = {};
      users.forEach(user => {
        usersMap[user.userId || user.id] = user;
      });

      // Map PaymentResponseDto to transaction format
      const mappedTransactions = paymentsList.map((payment) => {
        const user = usersMap[payment.userId] || {};
        const userName = user.fullName || user.email || `User #${payment.userId}`;
        
        // Determine transaction type based on payment
        let type = 'charging';
        if (!payment.sessionId) {
          type = 'topup'; // Deposit payment
        } else if (payment.paymentStatus === 'refunded') {
          type = 'refund';
        }

        // Map payment status (enum) to lowercase string
        const status = payment.paymentStatus?.toLowerCase() || 'pending';

        // Format amount (BigDecimal from backend)
        const amount = payment.amount ? parseFloat(payment.amount) : 0;

        return {
          id: payment.paymentId,
          transactionId: `TXN${String(payment.paymentId).padStart(6, '0')}`,
          paymentId: payment.paymentId,
          userId: payment.userId,
          userName: userName,
          type: type,
          status: status,
          amount: amount,
          sessionId: payment.sessionId ? `SES${String(payment.sessionId).padStart(6, '0')}` : null,
          stationId: null, // Will need to fetch from session if needed
          stationName: null, // Will need to fetch from session if needed
          paymentMethod: payment.paymentMethod?.toLowerCase() || 'wallet',
          createdAt: payment.createdAt || payment.paymentTime,
          paymentTime: payment.paymentTime,
          description: type === 'topup' ? 'Nạp tiền vào ví' : 
                       type === 'refund' ? 'Hoàn tiền' :
                       `Thanh toán phiên sạc ${payment.sessionId || ''}`,
        };
      });

      setTransactions(mappedTransactions);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Không thể tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.transactionId?.toLowerCase().includes(query) ||
        t.userName?.toLowerCase().includes(query) ||
        t.stationName?.toLowerCase().includes(query) ||
        t.sessionId?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.createdAt);
        switch (dateFilter) {
          case 'today':
            return transactionDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return transactionDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return transactionDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'amount':
          return (b.amount || 0) - (a.amount || 0);
        case 'user':
          return (a.userName || '').localeCompare(b.userName || '');
        default:
          return 0;
      }
    });

    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredTransactions(filtered.slice(startIndex, endIndex));
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'Thành công', color: '#10b981', bg: '#d1fae5' },
      pending: { label: 'Chờ xử lý', color: '#f59e0b', bg: '#fef3c7' },
      failed: { label: 'Thất bại', color: '#ef4444', bg: '#fee2e2' },
      refunded: { label: 'Đã hoàn tiền', color: '#6366f1', bg: '#e0e7ff' },
      cancelled: { label: 'Đã hủy', color: '#64748b', bg: '#f1f5f9' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      charging: { label: 'Sạc điện', icon: 'fa-bolt', color: '#3b82f6', bg: '#dbeafe' },
      topup: { label: 'Nạp tiền', icon: 'fa-wallet', color: '#10b981', bg: '#d1fae5' },
      refund: { label: 'Hoàn tiền', icon: 'fa-undo', color: '#f59e0b', bg: '#fef3c7' },
      package: { label: 'Gói dịch vụ', icon: 'fa-box', color: '#8b5cf6', bg: '#ede9fe' },
    };
    const config = typeConfig[type] || typeConfig.charging;
    return (
      <span className="type-badge" style={{ color: config.color, background: config.bg }}>
        <i className={`fas ${config.icon}`}></i>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  const formatDate = (dateString) => {
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

  const totalTransactions = transactions.length;
  const totalAmount = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Calculate pagination
  const totalPages = Math.ceil(
    transactions.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!t.transactionId?.toLowerCase().includes(query) &&
            !t.userName?.toLowerCase().includes(query)) return false;
      }
      return true;
    }).length / itemsPerPage
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="transactions-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách giao dịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-management">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Quản lý Giao dịch</h2>
          <p>Theo dõi và quản lý tất cả giao dịch trong hệ thống</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchTransactions}>
            <i className="fas fa-refresh"></i>
            Làm mới
          </button>
          <button className="btn-secondary" onClick={() => alert('Tính năng export đang phát triển')}>
            <i className="fas fa-download"></i>
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-value">{totalTransactions}</div>
          <div className="stat-label">Tổng giao dịch</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#10b981' }}>
            {transactions.filter(t => t.status === 'completed').length}
          </div>
          <div className="stat-label">Thành công</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {transactions.filter(t => t.status === 'pending').length}
          </div>
          <div className="stat-label">Chờ xử lý</div>
        </div>
        <div className="stat-item">
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {formatCurrency(totalAmount)}
          </div>
          <div className="stat-label">Tổng doanh thu</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã GD, tên người dùng, trạm..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="completed">Thành công</option>
          <option value="pending">Chờ xử lý</option>
          <option value="failed">Thất bại</option>
          <option value="refunded">Đã hoàn tiền</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">Tất cả loại</option>
          <option value="charging">Sạc điện</option>
          <option value="topup">Nạp tiền</option>
          <option value="refund">Hoàn tiền</option>
          <option value="package">Gói dịch vụ</option>
        </select>
        <select
          className="filter-select"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">Tất cả thời gian</option>
          <option value="today">Hôm nay</option>
          <option value="week">7 ngày qua</option>
          <option value="month">30 ngày qua</option>
        </select>
        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date">Mới nhất</option>
          <option value="amount">Giá trị cao nhất</option>
          <option value="user">Theo người dùng</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchTransactions}>
            Thử lại
          </button>
        </div>
      )}

      {/* Transactions Table */}
      {!error && (
        <>
          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Mã GD</th>
                  <th>Người dùng</th>
                  <th>Loại</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Trạm sạc</th>
                  <th>Thời gian</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data-cell">
                      <i className="fas fa-inbox"></i>
                      <p>Không tìm thấy giao dịch nào</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <span className="transaction-id">{transaction.transactionId}</span>
                      </td>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {transaction.userName?.charAt(0) || 'U'}
                          </div>
                          <span>{transaction.userName || `User #${transaction.userId}`}</span>
                        </div>
                      </td>
                      <td>{getTypeBadge(transaction.type)}</td>
                      <td>
                        <span className="amount-text">{formatCurrency(transaction.amount)}</span>
                      </td>
                      <td>{getStatusBadge(transaction.status)}</td>
                      <td>
                        {transaction.stationName ? (
                          <span className="station-text">{transaction.stationName}</span>
                        ) : (
                          <span className="no-station">-</span>
                        )}
                      </td>
                      <td>
                        <span className="date-text">{formatDate(transaction.createdAt)}</span>
                      </td>
                      <td>
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewTransaction(transaction)}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
                Trước
              </button>
              <span className="pagination-info">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}

      {/* Transaction Detail Modal */}
      {showModal && selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => {
            setShowModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}
    </div>
  );
};

// Transaction Detail Modal Component
const TransactionDetailModal = ({ transaction, onClose }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'Thành công', color: '#10b981', bg: '#d1fae5' },
      pending: { label: 'Chờ xử lý', color: '#f59e0b', bg: '#fef3c7' },
      failed: { label: 'Thất bại', color: '#ef4444', bg: '#fee2e2' },
      refunded: { label: 'Đã hoàn tiền', color: '#6366f1', bg: '#e0e7ff' },
      cancelled: { label: 'Đã hủy', color: '#64748b', bg: '#f1f5f9' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      charging: { label: 'Sạc điện', icon: 'fa-bolt', color: '#3b82f6', bg: '#dbeafe' },
      topup: { label: 'Nạp tiền', icon: 'fa-wallet', color: '#10b981', bg: '#d1fae5' },
      refund: { label: 'Hoàn tiền', icon: 'fa-undo', color: '#f59e0b', bg: '#fef3c7' },
      package: { label: 'Gói dịch vụ', icon: 'fa-box', color: '#8b5cf6', bg: '#ede9fe' },
    };
    const config = typeConfig[type] || typeConfig.charging;
    return (
      <span className="type-badge" style={{ color: config.color, background: config.bg }}>
        <i className={`fas ${config.icon}`}></i>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
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
          <h3>Chi tiết giao dịch</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="transaction-detail-info">
            <div className="info-row">
              <span className="info-label">Mã giao dịch:</span>
              <span className="info-value transaction-id-large">{transaction.transactionId}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Người dùng:</span>
              <span className="info-value">{transaction.userName || `User #${transaction.userId}`}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Loại:</span>
              {getTypeBadge(transaction.type)}
            </div>
            <div className="info-row">
              <span className="info-label">Trạng thái:</span>
              {getStatusBadge(transaction.status)}
            </div>
            <div className="info-row">
              <span className="info-label">Số tiền:</span>
              <span className="info-value amount-large">{formatCurrency(transaction.amount)}</span>
            </div>
            {transaction.sessionId && (
              <div className="info-row">
                <span className="info-label">Phiên sạc:</span>
                <span className="info-value">{transaction.sessionId}</span>
              </div>
            )}
            {transaction.stationName && (
              <div className="info-row">
                <span className="info-label">Trạm sạc:</span>
                <span className="info-value">{transaction.stationName}</span>
              </div>
            )}
            {transaction.description && (
              <div className="info-row">
                <span className="info-label">Mô tả:</span>
                <span className="info-value">{transaction.description}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">Thời gian:</span>
              <span className="info-value">{formatDate(transaction.createdAt)}</span>
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

export default TransactionsManagement;
