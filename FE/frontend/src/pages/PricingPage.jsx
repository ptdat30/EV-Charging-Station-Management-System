// src/pages/PricingPage.jsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Pricing.css';

const PricingPage = () => {
  const plans = [
    {
      name: 'Gói Cơ bản',
      price: '299.000',
      period: '/tháng',
      description: 'Phù hợp cho trạm nhỏ, mới bắt đầu',
      features: [
        'Tối đa 5 cổng sạc',
        'Báo cáo cơ bản',
        'Hỗ trợ email 48h',
        'Không giới hạn phiên sạc',
        'Cập nhật OTA',
        'Không có quảng cáo'
      ],
      popular: false,
      cta: 'Bắt đầu miễn phí'
    },
    {
      name: 'Gói Chuyên nghiệp',
      price: '799.000',
      period: '/tháng',
      description: 'Dành cho hệ thống trung bình, nhiều trạm',
      features: [
        'Tối đa 20 cổng sạc',
        'Báo cáo nâng cao + xuất Excel',
        'Hỗ trợ ưu tiên 24/7',
        'Tích hợp thanh toán tự động',
        'Quản lý đặt chỗ',
        'API truy cập dữ liệu',
        'Tùy chỉnh thương hiệu'
      ],
      popular: true,
      cta: 'Dùng thử 14 ngày'
    },
    {
      name: 'Gói Doanh nghiệp',
      price: 'Liên hệ',
      period: '',
      description: 'Giải pháp toàn diện cho chuỗi trạm lớn',
      features: [
        'Không giới hạn cổng sạc',
        'Dashboard quản trị đa trạm',
        'Hỗ trợ VIP 24/7 + SLA 99.9%',
        'Tích hợp ERP & CRM',
        'Bảo mật cấp doanh nghiệp',
        'Tùy biến theo yêu cầu',
        'Đào tạo & triển khai'
      ],
      popular: false,
      cta: 'Liên hệ tư vấn'
    }
  ];

  return (
    <>
      <Header />
      <main className="pricing-page">
        {/* Hero Section */}
        <section className="pricing-hero">
          <div className="container">
            <h1>Bảng giá linh hoạt cho mọi quy mô</h1>
            <p className="subtitle">
              Chọn gói phù hợp để quản lý trạm sạc EV thông minh, tiết kiệm chi phí và tăng trưởng bền vững.
            </p>
            <div className="toggle-switch">
              <span className="label">Thanh toán hàng tháng</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
              <span className="label">Thanh toán hàng năm <span className="save">Tiết kiệm 20%</span></span>
            </div>
          </div>
        </section>

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
                    <p className="desc">{plan.description}</p>
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
            <h2>So sánh chi tiết các gói</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Tính năng</th>
                    <th>Cơ bản</th>
                    <th>Chuyên nghiệp</th>
                    <th>Doanh nghiệp</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Số cổng sạc</td>
                    <td>5</td>
                    <td>20</td>
                    <td>Không giới hạn</td>
                  </tr>
                  <tr>
                    <td>Báo cáo</td>
                    <td>Cơ bản</td>
                    <td>Nâng cao + Excel</td>
                    <td>Đầy đủ + BI</td>
                  </tr>
                  <tr>
                    <td>Hỗ trợ</td>
                    <td>Email 48h</td>
                    <td>24/7 ưu tiên</td>
                    <td>VIP + SLA</td>
                  </tr>
                  <tr>
                    <td>Thanh toán tự động</td>
                    <td className="no">Không</td>
                    <td className="yes">Có</td>
                    <td className="yes">Có</td>
                  </tr>
                  <tr>
                    <td>API & Tích hợp</td>
                    <td className="no">Không</td>
                    <td className="yes">Có</td>
                    <td className="yes">Tùy biến</td>
                  </tr>
                  <tr>
                    <td>Tùy chỉnh thương hiệu</td>
                    <td className="no">Không</td>
                    <td className="yes">Có</td>
                    <td className="yes">Toàn diện</td>
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
                { q: 'Tôi có thể thay đổi gói bất cứ lúc nào không?', a: 'Có! Bạn có thể nâng cấp hoặc hạ cấp gói bất kỳ lúc nào, hiệu lực ngay lập tức.' },
                { q: 'Có bản dùng thử miễn phí không?', a: 'Gói Chuyên nghiệp có 14 ngày dùng thử miễn phí. Gói Cơ bản không cần thẻ tín dụng.' },
                { q: 'Hóa đơn được gửi như thế nào?', a: 'Hóa đơn điện tử được gửi qua email vào đầu mỗi kỳ thanh toán.' },
                { q: 'Có hỗ trợ triển khai không?', a: 'Gói Doanh nghiệp bao gồm hỗ trợ triển khai và đào tạo miễn phí.' }
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
            <h2>Bạn chưa chắc chắn?</h2>
            <p>Liên hệ đội ngũ tư vấn để được giải pháp phù hợp nhất.</p>
            <button className="cta-contact">Liên hệ ngay</button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default PricingPage;