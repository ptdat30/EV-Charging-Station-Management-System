import Header from './Header';           // Cùng thư mục components
import HeroSection from './HeroSection'; // Cùng thư mục
import Footer from './Footer';
import FeaturesSection from './FeaturesSection';
const HomePage = () => {
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