// src/pages/PricingPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { purchasePackage } from '../services/packageService';
import { getBalance } from '../services/walletService';
import '../styles/Pricing.css';

const PricingPage = () => {
  const { user, refreshUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const data = await getBalance();
      setBalance(data.balance || 0);
    } catch (err) {
      console.error('Error loading balance:', err);
    }
  };

  const plans = [
    {
      id: 'silver',
      name: 'Gói Bạc',
      price: 299000,
      period: '/tháng',
      packageType: 'SILVER',
      features: [
        'Sạc không giới hạn trong 30 ngày',
        'Tiết kiệm 25% so với gói trả trước',
        'Không phát sinh thêm phí',
        'Ưu tiên booking trạm sạc',
        'Hỗ trợ email 48h',
        'Mã khuyến mãi GOIBAC'
      ],
      popular: false,
      cta: 'Mua ngay'
    },
    {
      id: 'gold',
      name: 'Gói Vàng',
      price: 599000,
      period: '/tháng',
      packageType: 'GOLD',
      features: [
        'Sạc không giới hạn trong 30 ngày',
        'Tiết kiệm 40% so với gói trả trước',
        'Ưu tiên cao khi booking',
        'Hỗ trợ chat 24/7',
        'Báo cáo chi tiết',
        'Mã khuyến mãi GOIVANG'
      ],
      popular: true,
      cta: 'Mua ngay'
    },
    {
      id: 'platinum',
      name: 'Gói Bạch Kim',
      price: 999000,
      period: '/tháng',
      packageType: 'PLATINUM',
      features: [
        'Sạc không giới hạn trong 30 ngày',
        'Tiết kiệm 50% so với gói trả trước',
        'Ưu tiên cao nhất khi booking',
        'Hỗ trợ VIP 24/7',
        'Báo cáo nâng cao',
        'Bonus tính năng đặc biệt'
      ],
      popular: false,
      cta: 'Mua ngay'
    }
  ];

  const handlePurchase = async (plan) => {
    if (!user) {
      setMessage({ type: 'error', text: 'Vui lòng đăng nhập để mua gói dịch vụ' });
      return;
    }

    if (balance < plan.price) {
      setMessage({ type: 'error', text: 'Số dư ví không đủ. Vui lòng nạp thêm tiền.' });
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn mua ${plan.name} với giá ${plan.price.toLocaleString('vi-VN')}₫?`)) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await purchasePackage(plan.packageType);
      setMessage({ type: 'success', text: `Mua ${plan.name} thành công! Gói dịch vụ đã được áp dụng cho tài khoản của bạn.` });
      await loadBalance();
      
      // Update user context directly from response
      if (response?.data && updateUser) {
        // Response contains updated user data with subscriptionPackage
        updateUser({
          subscriptionPackage: response.data.subscriptionPackage,
          subscriptionExpiresAt: response.data.subscriptionExpiresAt
        });
        console.log('✅ User context updated with subscription:', response.data.subscriptionPackage);
      }
    } catch (error) {
      console.error('Error purchasing package:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Không thể mua gói dịch vụ. Vui lòng thử lại.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pricing-page">
      {/* Message Banner */}
      {message.text && (
        <div className={`message-banner ${message.type}`}>
          <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{message.text}</span>
        </div>
      )}

      {/* Pricing Cards */}
      <section className="pricing-cards">
        <div className="container">
          <div className="cards-grid">
            {plans.map((plan, index) => {
              const isActivePackage = user && user.subscriptionPackage === plan.packageType;
              return (
              <div
                key={plan.id}
                className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.id === 'silver' ? 'silver' : plan.id === 'gold' ? 'gold' : 'platinum'} ${isActivePackage ? 'active-package' : ''}`}
              >
                {plan.popular && <div className="popular-badge">Phổ biến nhất</div>}
                <div className="card-header">
                  <h3>{plan.name}</h3>
                  <div className="price">
                    <span className="amount">{plan.price.toLocaleString('vi-VN')}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                </div>

                <ul className="features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <i className="fas fa-check"></i>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  className={`cta-btn ${plan.popular ? 'primary' : 'secondary'}`}
                  onClick={() => handlePurchase(plan)}
                  disabled={loading || (user && user.subscriptionPackage === plan.packageType)}
                >
                  {loading ? 'Đang xử lý...' : (user && user.subscriptionPackage === plan.packageType ? 'Đang sử dụng' : plan.cta)}
                </button>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="comparison-table">
        <div className="container">
          <h2>So sánh các gói dịch vụ</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tính năng</th>
                  <th>Gói Bạc</th>
                  <th>Gói Vàng</th>
                  <th>Gói Bạch Kim</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Giá</td>
                  <td>299.000₫/tháng</td>
                  <td>599.000₫/tháng</td>
                  <td>999.000₫/tháng</td>
                </tr>
                <tr>
                  <td>Số lần sạc</td>
                  <td>Không giới hạn</td>
                  <td>Không giới hạn</td>
                  <td>Không giới hạn</td>
                </tr>
                <tr>
                  <td>Tiết kiệm</td>
                  <td className="yes">25%</td>
                  <td className="yes">40%</td>
                  <td className="yes">50%</td>
                </tr>
                <tr>
                  <td>Ưu tiên booking</td>
                  <td className="yes">Ưu tiên</td>
                  <td className="yes">Ưu tiên cao</td>
                  <td className="yes">Ưu tiên cao nhất</td>
                </tr>
                <tr>
                  <td>Hỗ trợ khách hàng</td>
                  <td>Email 48h</td>
                  <td>Chat 24/7</td>
                  <td className="yes">VIP 24/7</td>
                </tr>
                <tr>
                  <td>Báo cáo</td>
                  <td className="no">Cơ bản</td>
                  <td className="yes">Chi tiết</td>
                  <td className="yes">Nâng cao</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="container">
          <h2>Câu hỏi thường gặp</h2>
          <div className="faq-grid">
            {[
              { q: 'Tôi có thể chuyển đổi giữa các gói không?', a: 'Có! Bạn có thể mua gói mới bất kỳ lúc nào. Gói cũ sẽ được thay thế bằng gói mới.' },
              { q: 'Gói có tự động gia hạn không?', a: 'Không, gói không tự động gia hạn. Bạn cần mua lại khi gói hết hạn.' },
              { q: 'Gói có hiệu lực trong bao lâu?', a: 'Mỗi gói có hiệu lực 30 ngày kể từ ngày mua.' },
              { q: 'Gói Bạch Kim có gì đặc biệt?', a: 'Gói Bạch Kim mang lại nhiều ưu đãi nhất: ưu tiên cao nhất, hỗ trợ VIP 24/7, và các tính năng nâng cao độc quyền.' }
            ].map((faq, i) => (
              <div key={i} className="faq-item">
                <h4>{faq.q}</h4>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="pricing-cta">
        <div className="container">
          <h2>Bạn cần tư vấn thêm?</h2>
          <p>Liên hệ đội ngũ hỗ trợ để được giải pháp phù hợp nhất cho bạn.</p>
          <button className="cta-contact">Liên hệ hỗ trợ</button>
        </div>
      </section>
    </main>
  );
};

export default PricingPage;
