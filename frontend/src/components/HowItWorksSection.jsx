// src/components/HowItWorksSection.jsx
import React from 'react';
import '../styles/HowItWorksSection.css';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      icon: 'fas fa-map-marked-alt',
      title: 'Tìm Trạm Sạc',
      description: 'Sử dụng bản đồ hoặc tìm kiếm để tìm trạm sạc gần bạn nhất. Xem thông tin chi tiết về cổng sạc, giá cả và tình trạng.',
      color: '#84cc16'
    },
    {
      number: '02',
      icon: 'fas fa-calendar-check',
      title: 'Đặt Chỗ Trước',
      description: 'Chọn trạm và đặt chỗ trước để đảm bảo có cổng sạc sẵn sàng. Nhận thông báo xác nhận ngay lập tức.',
      color: '#60a5fa'
    },
    {
      number: '03',
      icon: 'fas fa-charging-station',
      title: 'Sạc & Thanh Toán',
      description: 'Đến trạm, cắm sạc và thanh toán dễ dàng qua ví điện tử. Theo dõi tiến trình sạc real-time trên app.',
      color: '#a855f7'
    }
  ];

  return (
    <section className="how-it-works-section">
      <div className="how-it-works-container">
        <div className="section-header">
          <h2 className="section-title">Cách Hoạt Động</h2>
          <p className="section-subtitle">
            Chỉ 3 bước đơn giản để bắt đầu sạc xe của bạn
          </p>
        </div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div 
                className="step-card"
                style={{ 
                  '--step-color': step.color,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div className="step-number">{step.number}</div>
                <div className="step-icon">
                  <i className={step.icon}></i>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
              
              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="step-arrow">
                  <i className="fas fa-arrow-right"></i>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

