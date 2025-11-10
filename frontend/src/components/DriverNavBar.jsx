// src/components/DriverNavBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import './DriverNavBar.css';

const DriverNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        // Navigate trước để tránh ProtectedRoute redirect về login
        navigate('/', { replace: true });
        // Sau đó mới logout để clear state
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
            path: '/route-planning',
            icon: 'fas fa-route',
            label: 'Lập lộ trình',
            description: 'Route Planning',
            roles: ['DRIVER'] // Chỉ driver
        },
        {
            path: '/stations/booking',
            icon: 'fas fa-calendar-check',
            label: 'Quản lý sạc',
            description: 'Reservations',
            roles: ['DRIVER'] // Chỉ driver
        },
        {
            path: '/payment',
            icon: 'fas fa-wallet',
            label: 'Ví điện tử',
            description: 'Wallet',
            roles: ['DRIVER'] // Chỉ driver
        },
        {
            path: '/loyalty',
            icon: 'fas fa-award',
            label: 'Điểm thưởng',
            description: 'Loyalty',
            roles: ['DRIVER'] // Chỉ driver
        },
        {
            path: '/pricing',
            icon: 'fas fa-box',
            label: 'Mua gói dịch vụ',
            description: 'Packages',
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
                    <div className="driver-navbar-user" ref={dropdownRef}>
                        {/* Notification Bell */}
                        <NotificationBell />
                        
                        <div 
                            className="user-info" 
                            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={`user-avatar ${
                                user?.subscriptionPackage === 'SILVER' ? 'package-silver' :
                                user?.subscriptionPackage === 'GOLD' ? 'package-gold' :
                                user?.subscriptionPackage === 'PLATINUM' ? 'package-platinum' : ''
                            }`}>
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="avatar-img" />
                                ) : user?.email ? (
                                    <span>{user.email.charAt(0).toUpperCase()}</span>
                                ) : (
                                    <i className="fas fa-user"></i>
                                )}
                            </div>
                        </div>

                        {/* Profile Dropdown */}
                        {isUserDropdownOpen && (
                            <div className="user-profile-dropdown">
                                <div className="dropdown-header">
                                    <div className="dropdown-user-info">
                                        <div className={`dropdown-avatar ${
                                            user?.subscriptionPackage === 'SILVER' ? 'package-silver' :
                                            user?.subscriptionPackage === 'GOLD' ? 'package-gold' :
                                            user?.subscriptionPackage === 'PLATINUM' ? 'package-platinum' : ''
                                        }`}>
                                            {user?.avatarUrl ? (
                                                <img src={user.avatarUrl} alt="Avatar" className="avatar-img" />
                                            ) : user?.email ? (
                                                <span>{user.email.charAt(0).toUpperCase()}</span>
                                            ) : (
                                                <i className="fas fa-user-circle"></i>
                                            )}
                                        </div>
                                        <div>
                                            <div className="dropdown-user-name">{user?.fullName || 'Driver'}</div>
                                            <div className="dropdown-user-email">{user?.email || ''}</div>
                                            {user?.subscriptionPackage && (
                                                <div className="dropdown-user-package">
                                                    {user.subscriptionPackage === 'SILVER' && '🥈 Gói Bạc'}
                                                    {user.subscriptionPackage === 'GOLD' && '🥇 Gói Vàng'}
                                                    {user.subscriptionPackage === 'PLATINUM' && '💎 Gói Bạch Kim'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <nav className="dropdown-nav">
                                    <Link 
                                        to="/notifications" 
                                        className={`dropdown-nav-item ${isActive('/notifications') ? 'active' : ''}`}
                                        onClick={() => setIsUserDropdownOpen(false)}
                                    >
                                        <i className="fas fa-bell"></i>
                                        <span>Thông báo</span>
                                    </Link>
                                    <Link 
                                        to="/driver/profile" 
                                        className={`dropdown-nav-item ${location.pathname.startsWith('/driver/profile') ? 'active' : ''}`}
                                        onClick={() => setIsUserDropdownOpen(false)}
                                    >
                                        <i className="fas fa-user"></i>
                                        <span>Hồ sơ cá nhân</span>
                                    </Link>
                                </nav>

                                <div className="dropdown-footer">
                                    <button 
                                        className="dropdown-logout-btn"
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
                        <div className="mobile-user-avatar">
                            {user?.email ? (
                                <span>{user.email.charAt(0).toUpperCase()}</span>
                            ) : (
                                <i className="fas fa-user-circle"></i>
                            )}
                        </div>
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
                            <div className="mobile-nav-right">
                                {isActive(item.path) && <i className="fas fa-chevron-right"></i>}
                            </div>
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

