// src/components/FeaturesSection.jsx
import React from 'react';
import '../styles/FeaturesSection.css';

const FeaturesSection = () => {
  const features = [
    {
      icon: 'fas fa-map-marked-alt',
      title: 'Tìm kiếm trên bản đồ',
      desc: 'Cung cấp vị trí chính xác các trạm sạc gần bạn, hỗ trợ điều hướng đến trạm sạc nhanh chóng và tiện lợi.'
    },
    {
      icon: 'fas fa-calendar-check',
      title: 'Đặt chỗ trước',
      desc: 'Thực hiện đặt chỗ trước tại các trạm sạc để đảm bảo có sẵn vị trí khi đến.'
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Thanh toán online',
      desc: 'Thanh toán nhanh chóng và an toàn qua ứng dụng, không cần mang theo tiền mặt.'
    },
    {
      icon: 'fas fa-headset',
      title: 'Theo dõi lịch sử',
      desc: 'Quản lý và theo dõi lịch sử sạc, hóa đơn và trạng thái sạc từ xa.'
    }
  ];

  return (
    <section className="features">
      <div className="features-container">
        <h2 className="features-title">Tính năng nổi bật</h2>
        <p className="features-subtitle">
          Trải nghiệm sạc xe điện hoàn toàn mới với các tính năng thông minh và tiện lợi
        </p>

        <div className="features-grid">
          {features.map((item, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                <i className={item.icon}></i>
              </div>
              <h3 className="feature-title">{item.title}</h3>
              <p className="feature-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;