// src/components/StatsSection.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../styles/StatsSection.css';

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Intersection Observer to trigger animation when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Animated counter hook
  const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;

      let startTime;
      let animationFrame;

      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = (currentTime - startTime) / duration;

        if (progress < 1) {
          setCount(Math.floor(end * progress));
          animationFrame = requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrame);
    }, [isVisible, end, duration]);

    return count;
  };

  const stations = useCounter(1247);
  const chargers = useCounter(5830);
  const users = useCounter(52340);
  const rating = useCounter(48, 2000); // 4.8 * 10

  return (
    <section className="stats-section" ref={sectionRef}>
      <div className="stats-container">
        <div className="stats-grid">
          {/* Stat 1 */}
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-charging-station"></i>
            </div>
            <div className="stat-number">
              {stations.toLocaleString()}+
            </div>
            <div className="stat-label">Trạm Sạc</div>
          </div>

          {/* Stat 2 */}
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-plug"></i>
            </div>
            <div className="stat-number">
              {chargers.toLocaleString()}+
            </div>
            <div className="stat-label">Cổng Sạc</div>
          </div>

          {/* Stat 3 */}
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-number">
              {users.toLocaleString()}+
            </div>
            <div className="stat-label">Người Dùng</div>
          </div>

          {/* Stat 4 */}
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="stat-number">
              {(rating / 10).toFixed(1)}★
            </div>
            <div className="stat-label">Đánh Giá</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

