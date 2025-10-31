import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import Footer from './Footer';
import FeaturesSection from './FeaturesSection';

const HomePage = () => {
  // HomePage luôn hiển thị với Header (navbar) ở trên
  // Header có nút "Đăng nhập" và "Đăng ký" nếu chưa đăng nhập
  // Redirect chỉ xảy ra khi user click đăng nhập và login thành công (trong Login component)
  return (
    <main>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </main>
  );
};

export default HomePage;