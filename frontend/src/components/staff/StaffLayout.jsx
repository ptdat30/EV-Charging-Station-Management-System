// src/components/staff/StaffLayout.jsx
import React from 'react';
import StaffNavBar from './StaffNavBar';
import '../../styles/StaffLayout.css';

const StaffLayout = ({ children }) => {
  React.useEffect(() => {
    console.log('📋 StaffLayout mounted');
  }, []);

  return (
    <div className="staff-layout">
      <StaffNavBar />
      <main className="staff-page-content">
        {children}
      </main>
    </div>
  );
};

export default StaffLayout;

