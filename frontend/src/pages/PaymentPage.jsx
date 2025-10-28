// src/pages/PaymentPage.jsx
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Payment.css';

const PaymentPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');

  const plans = [
    {
      id: 'basic',
      name: 'Gói Cơ bản',
      price: '299.000',
      period: '/tháng',
      features: ['5 cổng sạc', 'Báo cáo cơ bản', 'Hỗ trợ email'],
      saving: null
    },
    {
      id: 'professional',
      name: 'Gói Chuyên nghiệp',
      price: '799.000',
      period: '/tháng',
      features: ['20 cổng sạc', 'Báo cáo nâng cao', 'Hỗ trợ 24/7', 'API'],
      saving: 'Tiết kiệm 20%',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Gói Doanh nghiệp',
      price: 'Liên hệ',
      period: '',
      features: ['Không giới hạn', 'Tùy biến', 'Hỗ trợ VIP'],
      saving: null
    }
  ];

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <>
      <Header />
      <main className="payment-page">
        {/* Hero */}
        <section className="payment-hero">
          <div className="container">
            <h1>Thanh toán an toàn & nhanh chóng</h1>
            <p className="subtitle">
              Hoàn tất thanh toán trong 30 giây. Bảo mật 100% với mã hóa SSL.
            </p>
            <div className="secure-badges">
              <img src="https://cdn-icons-png.flaticon.com/32/5968/5968756.png" alt="SSL" />
              <img src="https://cdn-icons-png.flaticon.com/32/5968/5968332.png" alt="Visa" />
              <img src="https://cdn-icons-png.flaticon.com/32/5968/5968346.png" alt="Mastercard" />
              <img src="https://cdn-icons-png.flaticon.com/32/888/888870.png" alt="Momo" />
            </div>
          </div>
        </section>

        <section className="payment-content">
          <div className="container">
            <div className="payment-grid">
              {/* Order Summary */}
              <div className="order-summary">
                <h2>Tóm tắt đơn hàng</h2>
                <div className="plan-selection">
                  {plans.map(plan => (
                    <div
                      key={plan.id}
                      className={`plan-card ${plan.id === selectedPlan ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && <div className="popular-tag">Phổ biến</div>}
                      {plan.saving && <div className="saving-tag">{plan.saving}</div>}
                      <div className="plan-info">
                        <h3>{plan.name}</h3>
                        <div className="price">
                          <span className="amount">{plan.price}</span>
                          <span className="period">{plan.period}</span>
                        </div>
                      </div>
                      <ul className="features">
                        {plan.features.map((f, i) => (
                          <li key={i}><i className="fas fa-check"></i> {f}</li>
                        ))}
                      </ul>
                      {plan.id === selectedPlan && (
                        <div className="selected-check">
                          <i className="fas fa-check-circle"></i>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="summary-total">
                  <div className="total-row">
                    <span>Tạm tính</span>
                    <strong>799.000 VNĐ</strong>
                  </div>
                  <div className="total-row discount">
                    <span>Giảm giá (20%)</span>
                    <strong>-159.800 VNĐ</strong>
                  </div>
                  <div className="total-row final">
                    <span>Tổng cộng</span>
                    <strong className="final-price">639.200 VNĐ</strong>
                  </div>
                </div>

                <div className="promo-code">
                  <input type="text" placeholder="Mã giảm giá" />
                  <button>Áp dụng</button>
                </div>
              </div>

              {/* Payment Form */}
              <div className="payment-form-card">
                <h2>Thông tin thanh toán</h2>
                <form className="payment-form">
                  <div className="form-group">
                    <label>Số thẻ</label>
                    <div className="input-wrapper card-input">
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={formatCardNumber(cardNumber)}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength="19"
                      />
                      <i className="fas fa-credit-card"></i>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Hết hạn</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={formatExpiry(expiry)}
                          onChange={(e) => setExpiry(e.target.value)}
                          maxLength="5"
                        />
                        <i className="fas fa-calendar-alt"></i>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>CVC</label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          placeholder="123"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          maxLength="3"
                        />
                        <i className="fas fa-lock"></i>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Họ tên chủ thẻ</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        placeholder="NGUYEN VAN A"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <i className="fas fa-user"></i>
                    </div>
                  </div>

                  <div className="payment-methods">
                    <p>Chọn phương thức:</p>
                    <div className="methods">
                      <label className="method active">
                        <input type="radio" name="method" defaultChecked />
                        <img src="https://cdn-icons-png.flaticon.com/32/5968/5968332.png" alt="Visa" />
                        <span>Thẻ tín dụng</span>
                      </label>
                      <label className="method">
                        <input type="radio" name="method" />
                        <img src="https://cdn-icons-png.flaticon.com/32/888/888870.png" alt="Momo" />
                        <span>Momo</span>
                      </label>
                      <label className="method">
                        <input type="radio" name="method" />
                        <img src="https://cdn-icons-png.flaticon.com/32/5968/5968756.png" alt="Bank" />
                        <span>Chuyển khoản</span>
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="pay-btn">
                    <i className="fas fa-lock"></i>
                    Thanh toán 639.200 VNĐ
                  </button>

                  <p className="secure-note">
                    <i className="fas fa-shield-alt"></i>
                    Giao dịch được mã hóa SSL 256-bit. Chúng tôi không lưu thông tin thẻ.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default PaymentPage;