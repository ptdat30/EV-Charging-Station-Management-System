// src/pages/DriverApp/Profile/UserProfileScreen.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getMyProfile, updateMyProfile } from '../../../services/userService';
import './UserProfile.css';
import VehiclesManager from './VehiclesManager';
import TransactionsHistory from './TransactionsHistory';
import QuickStats from './QuickStats';
import { Link, useLocation } from 'react-router-dom';

function UserProfileScreen({ tab }) {
    const { user, token, isAuthenticated } = useAuth();
    const location = useLocation();
    const pathname = location.pathname;
    const [profileData, setProfileData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        emergencyContact: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            // Kiểm tra authentication
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

                // Ưu tiên dữ liệu từ API, fallback về user context
                setProfileData({
                    fullName: response.data?.fullName || user?.fullName || '',
                    email: response.data?.email || user?.email || '',
                    phone: response.data?.phone || user?.phone || '',
                    address: response.data?.address || '',
                    emergencyContact: response.data?.emergencyContact || '',
                });
            } catch (err) {
                console.error('❌ Failed to fetch profile:', err);

                // Xử lý các loại lỗi khác nhau
                if (err.response?.status === 404) {
                    setError('Không tìm thấy thông tin hồ sơ. Vui lòng tạo hồ sơ mới.');
                    // Fallback: Hiển thị thông tin từ user context
                    setProfileData({
                        fullName: user?.fullName || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        address: '',
                        emergencyContact: '',
                    });
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

    // Loading state
    if (loading && !profileData.email) {
        return (
            <div className="profile-screen">
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
            <div className="profile-screen">
                <div className="error-container">
                    <h2>⚠️ Bạn chưa đăng nhập</h2>
                    <p>Vui lòng <a href="/login">đăng nhập</a> để xem thông tin hồ sơ.</p>
                </div>
            </div>
        );
    }

    // Render
    return (
        <div className="profile-screen">
            <aside className="profile-sidebar">
                <div className="sidebar-title">Tài khoản</div>
                <nav>
                    <Link to="/driver/profile/info" className={/\/info\b/.test(pathname) ? 'active':''}>👤 Thông tin cá nhân</Link>
                    <Link to="/driver/profile/vehicles" className={/\/vehicles\b/.test(pathname) ? 'active':''}>🚗 Quản lý xe</Link>
                    <Link to="/driver/profile/history" className={/\/history\b/.test(pathname) ? 'active':''}>📊 Lịch sử giao dịch</Link>
                </nav>
                <QuickStats />
            </aside>
            <main className="profile-container">
                <h2>
                  {/\/info\b/.test(pathname) ? 'Thông tin cá nhân' :
                   /\/vehicles\b/.test(pathname) ? 'Quản lý xe'
                   : 'Lịch sử giao dịch'}
                </h2>
                {error && (
                    <div className="error-message">
                        <i className="fas fa-exclamation-triangle"></i>
                        {error}
                    </div>
                )}
                {/\/info\b/.test(pathname) && (
                <form onSubmit={handleSubmit} className="profile-form">
                    {/* Email (Read-only) */}
                    <div className="form-group">
                        <label htmlFor="email">
                            <i className="fas fa-envelope"></i>
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileData.email}
                            disabled
                            className="form-input-disabled"
                        />
                    </div>

                    {/* Full Name */}
                    <div className="form-group">
                        <label htmlFor="fullName">
                            <i className="fas fa-user"></i>
                            Họ và Tên
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={profileData.fullName}
                            onChange={handleChange}
                            disabled={!isEditing || loading}
                            required
                            className={!isEditing ? "form-input-disabled" : ""}
                        />
                    </div>

                    {/* Phone */}
                    <div className="form-group">
                        <label htmlFor="phone">
                            <i className="fas fa-phone"></i>
                            Số điện thoại
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={profileData.phone || ''}
                            onChange={handleChange}
                            disabled={!isEditing || loading}
                            placeholder="0912345678"
                            className={!isEditing ? "form-input-disabled" : ""}
                        />
                    </div>

                    {/* Address */}
                    <div className="form-group">
                        <label htmlFor="address">
                            <i className="fas fa-map-marker-alt"></i>
                            Địa chỉ
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            value={profileData.address || ''}
                            onChange={handleChange}
                            disabled={!isEditing || loading}
                            rows={3}
                            placeholder="Nhập địa chỉ của bạn"
                            className={!isEditing ? "form-input-disabled" : ""}
                        />
                    </div>

                    {/* Emergency Contact */}
                    <div className="form-group">
                        <label htmlFor="emergencyContact">
                            <i className="fas fa-ambulance"></i>
                            Liên hệ khẩn cấp
                        </label>
                        <input
                            type="tel"
                            id="emergencyContact"
                            name="emergencyContact"
                            value={profileData.emergencyContact || ''}
                            onChange={handleChange}
                            disabled={!isEditing || loading}
                            placeholder="0987654321"
                            className={!isEditing ? "form-input-disabled" : ""}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="profile-actions">
                        {isEditing ? (
                            <>
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
                                            <i className="fas fa-save"></i>
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
                                    <i className="fas fa-times"></i>
                                    Hủy
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleEditToggle}
                            >
                                <i className="fas fa-edit"></i>
                                Chỉnh sửa hồ sơ
                            </button>
                        )}
                    </div>
                </form>
                )}
                {/\/vehicles\b/.test(pathname) && (
                    <VehiclesManager />
                )}
                {/\/history\b/.test(pathname) && (
                    <TransactionsHistory />
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
                                profileData
                            }, null, 2)}</pre>
                        </details>
                    </div>
                )}
            </main>
        </div>
    );
}

export default UserProfileScreen;