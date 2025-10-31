import React, { useState } from 'react';
import HeroSection from './HeroSection';
import Footer from './Footer';
import HomePageMap from './HomePageMap';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

const HomePage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleOpenLoginModal = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleOpenRegisterModal = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  return (
    <main>
      <HeroSection 
        onLoginClick={handleOpenLoginModal} 
        onRegisterClick={handleOpenRegisterModal}
      />
      <HomePageMap />
      <Footer />
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={handleCloseLoginModal}
        onSwitchToRegister={handleOpenRegisterModal}
      />
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onClose={handleCloseRegisterModal}
        onSwitchToLogin={handleOpenLoginModal}
      />
    </main>
  );
};

export default HomePage;