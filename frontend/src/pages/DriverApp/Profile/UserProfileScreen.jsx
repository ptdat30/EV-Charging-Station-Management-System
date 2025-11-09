// src/pages/DriverApp/Profile/UserProfileScreen.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getMyProfile, updateMyProfile } from '../../../services/userService';
import { NavLink, useLocation } from 'react-router-dom';
import './UserProfile.css';
import VehiclesManager from './VehiclesManager';
import TransactionsHistory from './TransactionsHistory';

function UserProfileScreen({ tab }) {
    const { user, token, isAuthenticated, updateUser } = useAuth();
    const location = useLocation();
    const pathname = location.pathname;
    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        emergencyContact: '',
        avatarUrl: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!isAuthenticated || !token) {
                console.log('❌ Not authenticated, skipping profile fetch');
                setLoading(false);
                setError('Bạn cần đăng nhập để xem thông tin hồ sơ');
                return;
            }

            console.log('🔄 Fetching profile... Token:', token ? 'exists' : 'missing');
            setLoading(true);
            setError('');

            try {
                const response = await getMyProfile();
                console.log('✅ Profile fetched successfully:', response.data);

                const avatarUrl = response.data?.avatarUrl || user?.avatarUrl || '';
                setProfileData({
                    fullName: response.data?.fullName || user?.fullName || '',
                    email: response.data?.email || user?.email || '',
                    phone: response.data?.phone || user?.phone || '',
                    address: response.data?.address || '',
                    emergencyContact: response.data?.emergencyContact || '',
                    avatarUrl: avatarUrl,
                });
                setAvatarPreview(avatarUrl || null);
                
                // Update user context with avatar if available
                if (avatarUrl && updateUser) {
                    updateUser({ avatarUrl });
                }
            } catch (err) {
                console.error('❌ Failed to fetch profile:', err);

                if (err.response?.status === 404) {
                    setError('Không tìm thấy thông tin hồ sơ. Vui lòng tạo hồ sơ mới.');
                    setProfileData({
                        fullName: user?.fullName || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        address: '',
                        emergencyContact: '',
                        avatarUrl: user?.avatarUrl || '',
                    });
                    setAvatarPreview(user?.avatarUrl || null);
                } else if (err.response?.status === 401) {
                    setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                } else if (err.response?.status === 403) {
                    setError('Bạn không có quyền truy cập thông tin này.');
                } else {
                    setError(err.response?.data?.message || 'Không thể tải thông tin hồ sơ. Vui lòng thử lại.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token, isAuthenticated, user]);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('🔄 Updating profile...', profileData);

        try {
            const dataToUpdate = {
                address: profileData.address,
                emergencyContact: profileData.emergencyContact,
                fullName: profileData.fullName,
                phone: profileData.phone,
            };

            const response = await updateMyProfile(dataToUpdate);
            console.log('✅ Profile updated successfully:', response.data);

            setIsEditing(false);
            alert('Cập nhật hồ sơ thành công!');
        } catch (err) {
            console.error('❌ Failed to update profile:', err);
            setError(err.response?.data?.message || 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Vui lòng chọn file ảnh');
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Kích thước ảnh không được vượt quá 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload avatar
        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const { uploadAvatar } = await import('../../../services/userService');
            const response = await uploadAvatar(formData);
            
            const avatarUrl = response.data?.avatarUrl || response.data?.url;
            if (avatarUrl) {
                setProfileData({ ...profileData, avatarUrl });
                // Update user context to reflect avatar in navbar
                if (updateUser) {
                    updateUser({ avatarUrl });
                }
                setError('');
                alert('Cập nhật avatar thành công!');
            }
        } catch (err) {
            console.error('❌ Failed to upload avatar:', err);
            setError(err.response?.data?.message || 'Không thể tải lên avatar. Vui lòng thử lại.');
            setAvatarPreview(null);
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Get initials for avatar
    const getInitials = () => {
        const name = profileData.fullName || user?.fullName || user?.email || 'U';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Loading state
    if (loading && !profileData.email) {
        return (
            <div className="github-profile-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin hồ sơ...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!isAuthenticated) {
        return (
            <div className="github-profile-container">
                <div className="error-container">
                    <h2>⚠️ Bạn chưa đăng nhập</h2>
                    <p>Vui lòng <a href="/login">đăng nhập</a> để xem thông tin hồ sơ.</p>
                </div>
            </div>
        );
    }

    const activeTab = /\/info\b/.test(pathname) ? 'info' :
                     /\/vehicles\b/.test(pathname) ? 'vehicles' :
                     /\/history\b/.test(pathname) ? 'history' : 'info';

    return (
        <div className="github-profile-container">
            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-header-content">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar-container">
                            {(avatarPreview || profileData.avatarUrl) && (
                                <img 
                                    src={avatarPreview || profileData.avatarUrl} 
                                    alt="Avatar" 
                                    className={`profile-avatar-img ${
                                        user?.subscriptionPackage === 'SILVER' ? 'package-silver' :
                                        user?.subscriptionPackage === 'GOLD' ? 'package-gold' :
                                        user?.subscriptionPackage === 'PLATINUM' ? 'package-platinum' : ''
                                    }`}
                                    onError={(e) => {
                                        console.error('❌ Avatar load error');
                                        e.target.style.display = 'none';
                                        const fallback = e.target.nextElementSibling;
                                        if (fallback) fallback.style.display = 'flex';
                                    }}
                                />
                            )}
                            {!(avatarPreview || profileData.avatarUrl) && (
                                <div 
                                    className={`profile-avatar ${
                                        user?.subscriptionPackage === 'SILVER' ? 'package-silver' :
                                        user?.subscriptionPackage === 'GOLD' ? 'package-gold' :
                                        user?.subscriptionPackage === 'PLATINUM' ? 'package-platinum' : ''
                                    }`}
                                >
                                    {getInitials()}
                                </div>
                            )}
                            <label className="avatar-upload-btn" htmlFor="avatar-upload" title="Đổi avatar">
                                {uploadingAvatar ? (
                                    <span className="spinner-small"></span>
                                ) : (
                                    <i className="fas fa-camera"></i>
                                )}
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                                disabled={uploadingAvatar}
                            />
                        </div>
                    </div>
                    <div className="profile-info">
                        <div className="profile-name-row">
                            <h1 className="profile-name">{profileData.fullName || user?.fullName || 'Người dùng'}</h1>
                            {user?.subscriptionPackage && (
                                <span className={`subscription-badge ${user.subscriptionPackage.toLowerCase()}`}>
                                    {user.subscriptionPackage === 'SILVER' && '🥈 Gói Bạc'}
                                    {user.subscriptionPackage === 'GOLD' && '🥇 Gói Vàng'}
                                    {user.subscriptionPackage === 'PLATINUM' && '💎 Gói Bạch Kim'}
                                </span>
                            )}
                        </div>
                        <div className="profile-username">{profileData.email || user?.email || ''}</div>
                        {user?.subscriptionExpiresAt && (
                            <div className="subscription-expiry">
                                Gói dịch vụ hết hạn: {new Date(user.subscriptionExpiresAt).toLocaleDateString('vi-VN')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="profile-nav-container">
                <nav className="profile-nav">
                    <NavLink 
                        to="/driver/profile/info" 
                        className={({ isActive }) => `nav-item ${isActive ? 'selected' : ''}`}
                    >
                        <span className="nav-item-text">Thông tin</span>
                    </NavLink>
                    <NavLink 
                        to="/driver/profile/vehicles" 
                        className={({ isActive }) => `nav-item ${isActive ? 'selected' : ''}`}
                    >
                        <span className="nav-item-text">Quản lý xe</span>
                    </NavLink>
                    <NavLink 
                        to="/driver/profile/history" 
                        className={({ isActive }) => `nav-item ${isActive ? 'selected' : ''}`}
                    >
                        <span className="nav-item-text">Lịch sử giao dịch</span>
                    </NavLink>
                </nav>
            </div>

            {/* Content Area */}
            <div className="profile-content">
                {error && (
                    <div className="profile-error-banner">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Info Tab */}
                {activeTab === 'info' && (
                    <div className="profile-section">
                        <div className="section-header">
                            <h2>Thông tin cá nhân</h2>
                            {!isEditing && (
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={handleEditToggle}
                                >
                                    <i className="fas fa-pencil-alt"></i>
                                    Chỉnh sửa
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="profile-form-github">
                            <div className="form-field">
                                <label htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={profileData.email}
                                    disabled
                                    className="form-control form-control-disabled"
                                />
                                <p className="form-caption">Email không thể thay đổi</p>
                            </div>

                            <div className="form-field">
                                <label htmlFor="fullName">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={profileData.fullName}
                                    onChange={handleChange}
                                    disabled={!isEditing || loading}
                                    required
                                    className="form-control"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="phone">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={profileData.phone || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing || loading}
                                    className="form-control"
                                    placeholder="0912345678"
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="address">
                                    Địa chỉ
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={profileData.address || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing || loading}
                                    rows={3}
                                    className="form-control"
                                    placeholder="Nhập địa chỉ của bạn"
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="emergencyContact">
                                    Liên hệ khẩn cấp
                                </label>
                                    <input
                                        type="tel"
                                        id="emergencyContact"
                                        name="emergencyContact"
                                        value={profileData.emergencyContact || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing || loading}
                                        className="form-control"
                                        placeholder="0987654321"
                                    />
                            </div>

                            {isEditing && (
                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-small"></span>
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-check"></i>
                                                Lưu thay đổi
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleEditToggle}
                                        disabled={loading}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                )}

                {/* Vehicles Tab */}
                {activeTab === 'vehicles' && (
                    <div className="profile-section">
                        <div className="section-header">
                            <h2>Quản lý xe</h2>
                        </div>
                        <VehiclesManager />
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="profile-section">
                        <div className="section-header">
                            <h2>Lịch sử giao dịch</h2>
                        </div>
                        <TransactionsHistory />
                    </div>
                )}

                {/* Debug Info (Dev Only) */}
                {import.meta.env.DEV && (
                    <div className="debug-info">
                        <details>
                            <summary>🔍 Debug Info</summary>
                            <pre>{JSON.stringify({
                                isAuthenticated,
                                hasToken: !!token,
                                hasUser: !!user,
                                profileData,
                                activeTab
                            }, null, 2)}</pre>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserProfileScreen;