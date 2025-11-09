// src/components/staff/StaffNavBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './StaffNavBar.css';

const StaffNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Debug: Log user info
    useEffect(() => {
        console.log('👤 StaffNavBar - User:', user);
        console.log('👤 StaffNavBar - Location:', location.pathname);
    }, [user, location]);

    const handleLogout = () => {
        navigate('/', { replace: true });
        setTimeout(() => {
            logout();
        }, 0);
    };

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(path);
    };

    // Đóng dropdown khi click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };

        if (isUserDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserDropdownOpen]);

    // Menu items cho Staff
    const navItems = [
        {
            path: '/staff',
            icon: 'fas fa-home',
            label: 'Tổng quan',
            description: 'Dashboard'
        },
        {
            path: '/staff/sessions',
            icon: 'fas fa-bolt',
            label: 'Quản lý phiên sạc',
            description: 'Sessions'
        },
        {
            path: '/staff/payment',
            icon: 'fas fa-cash-register',
            label: 'Thanh toán tại chỗ',
            description: 'Payment'
        },
        {
            path: '/staff/monitoring',
            icon: 'fas fa-monitor-heart-rate',
            label: 'Theo dõi điểm sạc',
            description: 'Monitoring'
        },
        {
            path: '/staff/incidents',
            icon: 'fas fa-exclamation-triangle',
            label: 'Báo cáo sự cố',
            description: 'Incidents'
        }
    ];

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="staff-navbar">
                <div className="staff-navbar-container">
                    {/* Logo */}
                    <Link to="/staff" className="staff-navbar-logo">
                    </Link>

                    {/* Navigation Items */}
                    <div className="staff-navbar-menu">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`staff-nav-item ${isActive(item.path) ? 'active' : ''}`}
                                title={item.description}
                            >
                                <i className={item.icon}></i>
                                <span className="staff-nav-label">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* User Section */}
                    <div className="staff-navbar-user" ref={dropdownRef}>
                        <div
                            className="staff-user-info"
                            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="staff-user-avatar">
                                {user?.email ? (
                                    <span>{user.email.charAt(0).toUpperCase()}</span>
                                ) : (
                                    <i className="fas fa-user"></i>
                                )}
                            </div>
                        </div>

                        {/* Profile Dropdown */}
                        {isUserDropdownOpen && (
                            <div className="staff-user-dropdown">
                                <div className="staff-dropdown-header">
                                    <div className="staff-dropdown-user-info">
                                        <div className="staff-dropdown-avatar">
                                            {user?.email ? (
                                                <span>{user.email.charAt(0).toUpperCase()}</span>
                                            ) : (
                                                <i className="fas fa-user-circle"></i>
                                            )}
                                        </div>
                                        <div>
                                            <div className="staff-dropdown-user-name">{user?.fullName || 'Staff'}</div>
                                            <div className="staff-dropdown-user-email">{user?.email || 'staff@evcharge.vn'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="staff-dropdown-nav">
                                    <Link
                                        to="/driver/profile"
                                        className="staff-dropdown-nav-item"
                                        onClick={() => setIsUserDropdownOpen(false)}
                                    >
                                        <i className="fas fa-user"></i>
                                        <span>Hồ sơ</span>
                                    </Link>
                                </div>

                                <div className="staff-dropdown-footer">
                                    <button
                                        className="staff-dropdown-logout-btn"
                                        onClick={() => {
                                            setIsUserDropdownOpen(false);
                                            handleLogout();
                                        }}
                                    >
                                        <i className="fas fa-sign-out-alt"></i>
                                        <span>Đăng xuất</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={`staff-mobile-toggle ${isMobileMenuOpen ? 'open' : ''}`}
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
            <div className={`staff-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="staff-mobile-menu-header">
                    <div className="staff-mobile-user-info">
                        <div className="staff-mobile-avatar">
                            {user?.email ? (
                                <span>{user.email.charAt(0).toUpperCase()}</span>
                            ) : (
                                <i className="fas fa-user-circle"></i>
                            )}
                        </div>
                        <div>
                            <div className="staff-mobile-user-name">{user?.fullName || 'Staff'}</div>
                            <div className="staff-mobile-user-email">{user?.email || 'staff@evcharge.vn'}</div>
                        </div>
                    </div>
                </div>

                <div className="staff-mobile-menu-items">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`staff-mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                            {isActive(item.path) && <i className="fas fa-chevron-right"></i>}
                        </Link>
                    ))}
                </div>

                <div className="staff-mobile-menu-footer">
                    <button
                        className="staff-mobile-logout-btn"
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
                    className="staff-mobile-menu-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}
        </>
    );
};

export default StaffNavBar;

