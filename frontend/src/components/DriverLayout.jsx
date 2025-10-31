// src/components/DriverLayout.jsx
import React from 'react';
import DriverNavBar from './DriverNavBar';
import '../styles/DriverLayout.css';

const DriverLayout = ({ children }) => {
    return (
        <div className="driver-layout">
            <DriverNavBar />
            <main className="driver-main-content">
                {children}
            </main>
        </div>
    );
};

export default DriverLayout;

