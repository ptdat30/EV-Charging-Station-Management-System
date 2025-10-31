// src/components/DriverNavBar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DriverNavBar.css';

const DriverNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path);
    };

    // Lấy role của user
    const userRole = (user?.role || user?.roles?.[0] || '').toUpperCase();
    const isStaff = userRole === 'STAFF';

    // Menu items - ẩn một số items cho STAFF
    const allNavItems = [
        {
            path: '/dashboard',
            icon: 'fas fa-home',
            label: 'Trang chủ',
            description: 'Dashboard',
            roles: ['DRIVER', 'STAFF'] // Cả 2 đều có
        },
        {
            path: '/map',
            icon: 'fas fa-map-marker-alt',
            label: 'Tìm trạm sạc',
            description: 'Tìm trạm',
            roles: ['DRIVER', 'STAFF']
        },
        {
            path: '/stations/booking',
            icon: 'fas fa-calendar-check',
            label: 'Đặt chỗ',
            description: 'Reservations',
            roles: ['DRIVER'] // Chỉ driver
        },
        {
            path: '/driver/profile/history',
            icon: 'fas fa-history',
            label: 'Lịch sử',
            description: 'Transactions',
            roles: ['DRIVER'] // Chỉ driver
        },
        {
            path: '/driver/profile/info',
            icon: 'fas fa-user-circle',
            label: 'Hồ sơ',
            description: 'Profile',
            roles: ['DRIVER', 'STAFF']
        },
        {
            path: '/payment',
            icon: 'fas fa-wallet',
            label: 'Ví điện tử',
            description: 'Wallet',
            roles: ['DRIVER'] // Chỉ driver
        }
    ];

    // Filter menu items dựa trên role của user
    const navItems = allNavItems.filter(item => 
        item.roles.includes(userRole)
    );

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="driver-navbar">
                <div className="driver-navbar-container">
                    {/* Logo */}
                    <Link to="/dashboard" className="driver-navbar-logo">
                        <div className="logo-icon">⚡</div>
                        <span className="logo-text">EVCharge</span>
                    </Link>

                    {/* Navigation Items */}
                    <div className="driver-navbar-menu">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`driver-nav-item ${isActive(item.path) ? 'active' : ''}`}
                                title={item.description}
                            >
                                <i className={item.icon}></i>
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* User Section */}
                    <div className="driver-navbar-user">
                        <div className="user-info">
                            <i className="fas fa-user"></i>
                            <span className="user-name">{user?.fullName || user?.email || 'Driver'}</span>
                        </div>
                        <button 
                            className="btn-logout-nav"
                            onClick={handleLogout}
                            title="Đăng xuất"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Đăng xuất</span>
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={`driver-mobile-toggle ${isMobileMenuOpen ? 'open' : ''}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`driver-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-header">
                    <div className="mobile-user-info">
                        <i className="fas fa-user-circle"></i>
                        <div>
                            <div className="mobile-user-name">{user?.fullName || 'Driver'}</div>
                            <div className="mobile-user-email">{user?.email || ''}</div>
                        </div>
                    </div>
                </div>

                <div className="mobile-menu-items">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                            {isActive(item.path) && <i className="fas fa-chevron-right"></i>}
                        </Link>
                    ))}
                </div>

                <div className="mobile-menu-footer">
                    <button 
                        className="mobile-logout-btn"
                        onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleLogout();
                        }}
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="mobile-menu-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}
        </>
    );
};

export default DriverNavBar;

