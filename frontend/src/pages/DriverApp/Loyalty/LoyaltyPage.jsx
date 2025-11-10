// src/pages/DriverApp/Loyalty/LoyaltyPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  getLoyaltyAccount, 
  getPointsTransactions, 
  getTierInfo,
  formatPoints 
} from '../../../services/loyaltyService';
import './LoyaltyPage.css';

function LoyaltyPage() {
  const { user } = useAuth();
  const [loyaltyAccount, setLoyaltyAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'history'

  useEffect(() => {
    if (user?.userId) {
      fetchLoyaltyData();
    }
  }, [user]);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch loyalty account
      const accountData = await getLoyaltyAccount(user.userId);
      setLoyaltyAccount(accountData);
      
      // Fetch transactions
      const transactionsData = await getPointsTransactions(user.userId);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Error fetching loyalty data:', err);
      setError('Không thể tải thông tin điểm thưởng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getTierProgress = () => {
    if (!loyaltyAccount || !loyaltyAccount.pointsToNextTier) {
      return 100;
    }
    
    const currentPoints = loyaltyAccount.lifetimePoints;
    const nextTierPoints = currentPoints + loyaltyAccount.pointsToNextTier;
    
    // Calculate previous tier threshold
    const tierThresholds = {
      bronze: 0,
      silver: 1000,
      gold: 5000,
      platinum: 15000,
      diamond: 50000
    };
    
    const currentTierThreshold = tierThresholds[loyaltyAccount.tierLevel?.toLowerCase()] || 0;
    const pointsInCurrentTier = currentPoints - currentTierThreshold;
    const pointsNeededForNextTier = nextTierPoints - currentTierThreshold;
    
    return Math.min(100, (pointsInCurrentTier / pointsNeededForNextTier) * 100);
  };

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'earn': return 'fa-arrow-up';
      case 'redeem': return 'fa-arrow-down';
      case 'bonus': return 'fa-gift';
      case 'expire': return 'fa-clock';
      case 'refund': return 'fa-undo';
      case 'adjustment': return 'fa-cog';
      default: return 'fa-circle';
    }
  };

  const getTransactionIconColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'earn': return '#4CAF50';
      case 'redeem': return '#f44336';
      case 'bonus': return '#FF9800';
      case 'expire': return '#9E9E9E';
      case 'refund': return '#2196F3';
      case 'adjustment': return '#607D8B';
      default: return '#666';
    }
  };

  const getTransactionTypeText = (type) => {
    switch (type?.toLowerCase()) {
      case 'earn': return 'Tích điểm';
      case 'redeem': return 'Đổi điểm';
      case 'bonus': return 'Thưởng';
      case 'expire': return 'Hết hạn';
      case 'refund': return 'Hoàn điểm';
      case 'adjustment': return 'Điều chỉnh';
      default: return type;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loyalty-page">
        <div className="loyalty-container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải thông tin điểm thưởng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!loyaltyAccount) {
    return (
      <div className="loyalty-page">
        <div className="loyalty-container">
          <div className="error-container">
            <i className="fas fa-inbox"></i>
            <p>Chưa có tài khoản điểm thưởng</p>
            <button onClick={fetchLoyaltyData} className="btn-primary">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tierInfo = getTierInfo(loyaltyAccount.tierLevel);

  return (
    <div className="loyalty-page">
      <div className="loyalty-container">
        {/* Header */}
        <div className="page-header">
          <h1>
            <i className="fas fa-award"></i>
            Điểm Thưởng & Hạng Thành Viên
          </h1>
          <button onClick={fetchLoyaltyData} className="btn-refresh">
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {/* Tier Summary Card */}
        <div className="tier-summary-card">
          <div className="tier-current">
            <div className="tier-icon-large" style={{ background: tierInfo.gradient }}>
              <i className={tierInfo.iconClass}></i>
            </div>
            <div className="tier-details">
              <div className="tier-label">Hạng hiện tại</div>
              <div className="tier-name">{tierInfo.name}</div>
            </div>
          </div>
          
          <div className="points-summary">
            <div className="points-item">
              <div className="points-value">{formatPoints(loyaltyAccount.pointsBalance)}</div>
              <div className="points-label">Điểm khả dụng</div>
            </div>
            <div className="points-divider"></div>
            <div className="points-item">
              <div className="points-value">{formatPoints(loyaltyAccount.lifetimePoints)}</div>
              <div className="points-label">Tổng tích lũy</div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {loyaltyAccount.nextTierLevel && (
            <div className="tier-progress">
              <div className="progress-info">
                <span>Tiến độ lên hạng {getTierInfo(loyaltyAccount.nextTierLevel).name}</span>
                <span className="progress-remaining">
                  Còn {formatPoints(loyaltyAccount.pointsToNextTier)} điểm
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${getTierProgress()}%` }}
                ></div>
              </div>
            </div>
          )}

          {loyaltyAccount.nextTierLevel === null && (
            <div className="max-tier-notice">
              <i className="fas fa-crown"></i>
              Bạn đã đạt hạng cao nhất
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="loyalty-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-info-circle"></i>
            Tổng quan
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <i className="fas fa-history"></i>
            Lịch sử ({transactions.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            {/* Benefits Card */}
            <div className="benefits-card">
              <h3>
                <i className="fas fa-star"></i>
                Quyền lợi hạng {tierInfo.name}
              </h3>
              <ul className="benefits-list">
                {tierInfo.benefits.map((benefit, index) => (
                  <li key={index}>
                    <i className="fas fa-check-circle"></i>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How to Earn */}
            <div className="info-card">
              <h3>
                <i className="fas fa-lightbulb"></i>
                Cách tích điểm
              </h3>
              <div className="info-grid">
                <div className="info-box">
                  <i className="fas fa-charging-station"></i>
                  <h4>Sạc điện</h4>
                  <p>1 điểm / 1.000 VND</p>
                </div>
                <div className="info-box">
                  <i className="fas fa-gift"></i>
                  <h4>Khuyến mãi</h4>
                  <p>Điểm thưởng đặc biệt</p>
                </div>
                <div className="info-box">
                  <i className="fas fa-calendar-star"></i>
                  <h4>Sự kiện</h4>
                  <p>Điểm x2 ngày lễ</p>
                </div>
              </div>
            </div>

            {/* Tier Levels */}
            <div className="tiers-card">
              <h3>Các hạng thành viên</h3>
              <div className="tiers-list">
                {['bronze', 'silver', 'gold', 'platinum', 'diamond'].map((tier) => {
                  const info = getTierInfo(tier);
                  const isCurrentTier = tier === loyaltyAccount.tierLevel?.toLowerCase();
                  return (
                    <div 
                      key={tier} 
                      className={`tier-item ${isCurrentTier ? 'current' : ''}`}
                    >
                      <div className="tier-icon-sm" style={{ background: info.gradient }}>
                        <i className={info.iconClass}></i>
                      </div>
                      <div className="tier-name-sm">{info.name}</div>
                      {isCurrentTier && <span className="badge-current">Hiện tại</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="tab-content">
            <div className="history-card">
              <h3>
                <i className="fas fa-list"></i>
                Lịch sử giao dịch điểm
              </h3>
              
              {transactions.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox"></i>
                  <p>Chưa có giao dịch điểm nào</p>
                </div>
              ) : (
                <div className="transactions-table">
                  {transactions.map((transaction) => (
                    <div key={transaction.transactionId} className="transaction-row">
                      <div className="transaction-left">
                        <div className="transaction-icon" style={{ 
                          backgroundColor: getTransactionIconColor(transaction.transactionType) + '20',
                          color: getTransactionIconColor(transaction.transactionType)
                        }}>
                          <i className={`fas ${getTransactionIcon(transaction.transactionType)}`}></i>
                        </div>
                        <div className="transaction-info">
                          <div className="transaction-type">
                            {getTransactionTypeText(transaction.transactionType)}
                          </div>
                          <div className="transaction-date">
                            {formatDate(transaction.createdAt)}
                          </div>
                          {transaction.description && (
                            <div className="transaction-desc">
                              {transaction.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="transaction-right">
                        <div className={`transaction-points ${transaction.points >= 0 ? 'positive' : 'negative'}`}>
                          {transaction.points >= 0 ? '+' : ''}{formatPoints(transaction.points)}
                        </div>
                        <div className="transaction-balance">
                          Số dư: {formatPoints(transaction.balanceAfter)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoyaltyPage;

