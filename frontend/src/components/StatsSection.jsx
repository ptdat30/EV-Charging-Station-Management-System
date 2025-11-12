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

  const statColors = [
    '#84cc16', // Lime green - Trạm Sạc
    '#6e5494', // Purple - Cổng Sạc
    '#fbbf24', // Gold - Người Dùng
    '#5a4f7b'  // Dark purple - Đánh Giá
  ];

  return (
    <section className="stats-section" ref={sectionRef}>
      <div className="stats-container">
        <div className="stats-grid">
          {/* Stat 1 */}
          <div className="stat-card" data-color={statColors[0]}>
            <div className="stat-icon" style={{ 
              background: `linear-gradient(135deg, ${statColors[0]}40 0%, ${statColors[0]}20 100%)`,
              boxShadow: `0 8px 30px ${statColors[0]}30`
            }}>
              <i className="fas fa-charging-station" style={{ color: statColors[0] }}></i>
            </div>
            <div className="stat-number" style={{
              filter: `drop-shadow(0 2px 10px ${statColors[0]}40)`
            }}>
              {stations.toLocaleString()}+
            </div>
            <div className="stat-label">Trạm Sạc</div>
          </div>

          {/* Stat 2 */}
          <div className="stat-card" data-color={statColors[1]}>
            <div className="stat-icon" style={{ 
              background: `linear-gradient(135deg, ${statColors[1]}40 0%, ${statColors[1]}20 100%)`,
              boxShadow: `0 8px 30px ${statColors[1]}30`
            }}>
              <i className="fas fa-plug" style={{ color: statColors[1] }}></i>
            </div>
            <div className="stat-number" style={{
              filter: `drop-shadow(0 2px 10px ${statColors[1]}40)`
            }}>
              {chargers.toLocaleString()}+
            </div>
            <div className="stat-label">Cổng Sạc</div>
          </div>

          {/* Stat 3 */}
          <div className="stat-card" data-color={statColors[2]}>
            <div className="stat-icon" style={{ 
              background: `linear-gradient(135deg, ${statColors[2]}40 0%, ${statColors[2]}20 100%)`,
              boxShadow: `0 8px 30px ${statColors[2]}30`
            }}>
              <i className="fas fa-users" style={{ color: statColors[2] }}></i>
            </div>
            <div className="stat-number" style={{
              filter: `drop-shadow(0 2px 10px ${statColors[2]}40)`
            }}>
              {users.toLocaleString()}+
            </div>
            <div className="stat-label">Người Dùng</div>
          </div>

          {/* Stat 4 */}
          <div className="stat-card" data-color={statColors[3]}>
            <div className="stat-icon" style={{ 
              background: `linear-gradient(135deg, ${statColors[3]}40 0%, ${statColors[3]}20 100%)`,
              boxShadow: `0 8px 30px ${statColors[3]}30`
            }}>
              <i className="fas fa-star" style={{ color: statColors[3] }}></i>
            </div>
            <div className="stat-number" style={{
              filter: `drop-shadow(0 2px 10px ${statColors[3]}40)`
            }}>
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

