// src/components/admin/AdminNavBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';
import './AdminNavBar.css';

const AdminNavBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    // Menu items cho Admin
    const navItems = [
        {
            path: '/admin',
            icon: 'fas fa-home',
            label: 'Tổng quan',
            description: 'Dashboard'
        },
        {
            path: '/admin/stations',
            icon: 'fas fa-charging-station',
            label: 'Trạm sạc',
            description: 'Stations',
            submenu: [
                { path: '/admin/stations', label: 'Danh sách trạm' },
                { path: '/admin/stations/charging-points', label: 'Điểm sạc' },
                { path: '/admin/stations/monitoring', label: 'Theo dõi tình trạng' },
                { path: '/admin/stations/remote-control', label: 'Điều khiển từ xa' },
            ]
        },
        {
            path: '/admin/users',
            icon: 'fas fa-users',
            label: 'Người dùng',
            description: 'Users',
            submenu: [
                { path: '/admin/users/individual', label: 'Khách hàng cá nhân' },
                { path: '/admin/users/business', label: 'Khách hàng doanh nghiệp' },
            ]
        },
        {
            path: '/admin/staff',
            icon: 'fas fa-user-shield',
            label: 'Nhân viên',
            description: 'Staff Management'
        },
        {
            path: '/admin/packages',
            icon: 'fas fa-box',
            label: 'Gói dịch vụ',
            description: 'Packages',
            submenu: [
                { path: '/admin/packages/prepaid', label: 'Gói trả trước' },
                { path: '/admin/packages/postpaid', label: 'Gói trả sau' },
                { path: '/admin/packages/vip', label: 'Gói VIP' },
            ]
        },
        {
            path: '/admin/transactions',
            icon: 'fas fa-file-invoice-dollar',
            label: 'Giao dịch',
            description: 'Transactions'
        },
        {
            path: '/admin/reports',
            icon: 'fas fa-chart-bar',
            label: 'Báo cáo',
            description: 'Reports'
        },
        {
            path: '/admin/notifications',
            icon: 'fas fa-bell',
            label: 'Thông báo hệ thống',
            description: 'System Notifications'
        },
        {
            path: '/admin/settings',
            icon: 'fas fa-cog',
            label: 'Cài đặt',
            description: 'Settings'
        }
    ];

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="admin-navbar">
                <div className="admin-navbar-container">
                    {/* Logo */}
                    <Link to="/admin" className="admin-navbar-logo">
                    </Link>

                    {/* Navigation Items */}
                    <div className="admin-navbar-menu">
                        {navItems.map((item) => (
                            <div key={item.path} className="admin-nav-item-wrapper">
                                <Link
                                    to={item.path}
                                    className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
                                    title={item.description}
                                >
                                    <i className={item.icon}></i>
                                    <span className="admin-nav-label">{item.label}</span>
                                    {item.submenu && (
                                        <i className="fas fa-chevron-down admin-nav-chevron"></i>
                                    )}
                                </Link>
                                {/* TODO: Submenu dropdown sẽ được implement sau */}
                            </div>
                        ))}
                    </div>

                    {/* Notification Bell */}
                    <NotificationBell />

                    {/* User Section */}
                    <div className="admin-navbar-user" ref={dropdownRef}>
                        <div 
                            className="admin-user-info" 
                            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="admin-user-avatar">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="admin-avatar-img" />
                                ) : user?.email ? (
                                    <span>{user.email.charAt(0).toUpperCase()}</span>
                                ) : (
                                    <i className="fas fa-user"></i>
                                )}
                            </div>
                        </div>

                        {/* Profile Dropdown */}
                        {isUserDropdownOpen && (
                            <div className="admin-user-dropdown">
                                <div className="admin-dropdown-header">
                                    <div className="admin-dropdown-user-info">
                                        <div className="admin-dropdown-avatar">
                                            {user?.avatarUrl ? (
                                                <img src={user.avatarUrl} alt="Avatar" className="admin-avatar-img" />
                                            ) : user?.email ? (
                                                <span>{user.email.charAt(0).toUpperCase()}</span>
                                            ) : (
                                                <i className="fas fa-user-circle"></i>
                                            )}
                                        </div>
                                        <div>
                                            <div className="admin-dropdown-user-name">{user?.fullName || 'Admin'}</div>
                                            <div className="admin-dropdown-user-email">{user?.email || 'admin@evcharge.vn'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="admin-dropdown-nav">
                                    <Link 
                                        to="/admin/settings" 
                                        className="admin-dropdown-nav-item"
                                        onClick={() => setIsUserDropdownOpen(false)}
                                    >
                                        <i className="fas fa-cog"></i>
                                        <span>Cài đặt</span>
                                    </Link>
                                    <Link 
                                        to="/admin/profile" 
                                        className="admin-dropdown-nav-item"
                                        onClick={() => setIsUserDropdownOpen(false)}
                                    >
                                        <i className="fas fa-user"></i>
                                        <span>Hồ sơ</span>
                                    </Link>
                                </div>

                                <div className="admin-dropdown-footer">
                                    <button 
                                        className="admin-dropdown-logout-btn"
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
                        className={`admin-mobile-toggle ${isMobileMenuOpen ? 'open' : ''}`}
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
            <div className={`admin-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="admin-mobile-menu-header">
                    <div className="admin-mobile-user-info">
                        <div className="admin-mobile-avatar">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="admin-avatar-img" />
                            ) : user?.email ? (
                                <span>{user.email.charAt(0).toUpperCase()}</span>
                            ) : (
                                <i className="fas fa-user-circle"></i>
                            )}
                        </div>
                        <div>
                            <div className="admin-mobile-user-name">{user?.fullName || 'Admin'}</div>
                            <div className="admin-mobile-user-email">{user?.email || 'admin@evcharge.vn'}</div>
                        </div>
                    </div>
                </div>

                <div className="admin-mobile-menu-items">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`admin-mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <i className={item.icon}></i>
                            <span>{item.label}</span>
                            {isActive(item.path) && <i className="fas fa-chevron-right"></i>}
                        </Link>
                    ))}
                </div>

                <div className="admin-mobile-menu-footer">
                    <button 
                        className="admin-mobile-logout-btn"
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
                    className="admin-mobile-menu-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}
        </>
    );
};

export default AdminNavBar;

