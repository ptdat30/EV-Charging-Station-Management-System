// src/components/FeaturesSection.jsx
import React from 'react';
import '../styles/FeaturesSection.css';

const FeaturesSection = () => {
  const features = [
    {
      icon: 'fas fa-search-location',
      title: 'Tìm Trạm Nhanh Chóng',
      description: 'AI-powered search giúp tìm trạm sạc gần nhất chỉ trong vài giây',
      color: '#84cc16'
    },
    {
      icon: 'fas fa-bolt',
      title: 'Sạc Siêu Nhanh',
      description: 'Hệ thống sạc nhanh DC với công suất lên đến 150kW',
      color: '#60a5fa'
    },
    {
      icon: 'fas fa-wallet',
      title: 'Giá Cả Hợp Lý',
      description: 'Mức giá cạnh tranh với nhiều gói ưu đãi dành cho khách hàng thân thiết',
      color: '#a855f7'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Đặt Chỗ Thông Minh',
      description: 'Đặt trước cổng sạc, không lo chờ đợi hay hết chỗ',
      color: '#ec4899'
    },
    {
      icon: 'fas fa-gift',
      title: 'Tích Điểm Thưởng',
      description: 'Chương trình loyalty với điểm thưởng cho mỗi lần sạc',
      color: '#fbbf24'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'An Toàn & Bảo Mật',
      description: 'Thanh toán bảo mật, dữ liệu được mã hóa và bảo vệ tuyệt đối',
      color: '#10b981'
    }
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="section-header">
          <h2 className="section-title">Tại Sao Chọn Chúng Tôi?</h2>
          <p className="section-subtitle">
            Trải nghiệm sạc xe điện hiện đại với công nghệ tiên tiến
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon" style={{ '--icon-color': feature.color }}>
                <i className={feature.icon}></i>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
