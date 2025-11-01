// src/pages/PricingPage.jsx
import React from 'react';
import '../styles/Pricing.css';

const PricingPage = () => {
  const plans = [
    {
      name: 'Gói Trả Trước',
      price: '50.000',
      period: 'đồng/kWh',
      features: [
        'Thanh toán trực tiếp khi sạc',
        'Không cần đăng ký trước',
        'Giá cố định 50.000đ/kWh',
        'Phù hợp người dùng thỉnh thoảng',
        'Không giới hạn số lần sạc'
      ],
      popular: false,
      cta: 'Sạc ngay'
    },
    {
      name: 'Gói Hàng Tháng',
      price: '299.000',
      period: '/tháng',
      features: [
        'Sạc không giới hạn trong 30 ngày',
        'Tiết kiệm 25% so với gói trả trước',
        'Không phát sinh thêm phí',
        'Gia hạn tự động',
        'Ưu tiên booking trạm sạc'
      ],
      popular: true,
      cta: 'Đăng ký ngay'
    },
    {
      name: 'Gói Hàng Năm',
      price: '2.999.000',
      period: '/năm',
      features: [
        'Sạc không giới hạn trong 1 năm',
        'Tiết kiệm 40% so với gói trả trước',
        'Bonus 1 tháng miễn phí',
        'Ưu tiên cao nhất khi booking',
        'Hỗ trợ khách hàng VIP'
      ],
      popular: false,
      cta: 'Đăng ký ngay'
    }
  ];

  return (
    <main className="pricing-page">
      {/* Pricing Cards */}
      <section className="pricing-cards">
        <div className="container">
          <div className="cards-grid">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`pricing-card ${plan.popular ? 'popular' : ''}`}
              >
                {plan.popular && <div className="popular-badge">Phổ biến nhất</div>}
                <div className="card-header">
                  <h3>{plan.name}</h3>
                  <div className="price">
                    <span className="amount">{plan.price}</span>
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

                <button className={`cta-btn ${plan.popular ? 'primary' : 'secondary'}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
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
                  <th>Trả Trước</th>
                  <th>Hàng Tháng</th>
                  <th>Hàng Năm</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Giá</td>
                  <td>50.000đ/kWh</td>
                  <td>299.000đ/tháng</td>
                  <td>2.999.000đ/năm</td>
                </tr>
                <tr>
                  <td>Số lần sạc</td>
                  <td>Không giới hạn</td>
                  <td>Không giới hạn</td>
                  <td>Không giới hạn</td>
                </tr>
                <tr>
                  <td>Tiết kiệm</td>
                  <td>-</td>
                  <td className="yes">25%</td>
                  <td className="yes">40%</td>
                </tr>
                <tr>
                  <td>Ưu tiên booking</td>
                  <td className="no">Thông thường</td>
                  <td className="yes">Ưu tiên</td>
                  <td className="yes">Ưu tiên cao nhất</td>
                </tr>
                <tr>
                  <td>Gia hạn tự động</td>
                  <td className="no">Không</td>
                  <td className="yes">Có</td>
                  <td className="yes">Có</td>
                </tr>
                <tr>
                  <td>Hỗ trợ khách hàng</td>
                  <td>Email</td>
                  <td>Email + Chat</td>
                  <td className="yes">VIP 24/7</td>
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
              { q: 'Tôi có thể chuyển đổi giữa các gói không?', a: 'Có! Bạn có thể chuyển đổi gói bất kỳ lúc nào. Gói cũ sẽ được hoàn tiền theo tỷ lệ thời gian còn lại.' },
              { q: 'Gói hàng tháng có tự động gia hạn không?', a: 'Có, gói sẽ tự động gia hạn vào cuối mỗi chu kỳ. Bạn có thể tắt tính năng này trong cài đặt.' },
              { q: 'Tôi có thể hủy gói bất cứ lúc nào không?', a: 'Có, bạn có thể hủy gói bất cứ lúc nào mà không bị phạt. Số tiền còn lại sẽ được hoàn vào ví.' },
              { q: 'Gói hàng năm có ưu đãi gì thêm không?', a: 'Có! Bạn sẽ nhận thêm 1 tháng miễn phí và được ưu tiên booking tại các trạm sạc bận.' }
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
