import React, { useEffect, useState } from 'react';
import { addVehicle, deleteVehicle, getMyVehicles, setDefaultVehicle, updateVehicle } from '../../../services/userService';

const emptyVehicle = { 
    name: '', 
    plateNumber: '', 
    batteryCapacityKwh: '', 
    preferredChargerType: 'AC', 
    isDefault: false,
    imageUrl: ''
};

export default function VehiclesManager() {
    const [vehicles, setVehicles] = useState([]);
    const [form, setForm] = useState(emptyVehicle);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getMyVehicles();
            setVehicles(data || []);
        } catch (e) {
            setError(e.response?.data?.message || e.message || 'Không thể tải danh sách xe');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        load(); 
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (editingId) {
                await updateVehicle(editingId, normalize(form));
            } else {
                await addVehicle(normalize(form));
            }
            setForm(emptyVehicle);
            setEditingId(null);
            setShowForm(false);
            await load();
        } catch (e) {
            setError(e.response?.data?.message || e.message || 'Lỗi lưu xe');
        } finally {
            setLoading(false);
        }
    };

    const normalize = (v) => ({
        ...v,
        batteryCapacityKwh: v.batteryCapacityKwh ? Number(v.batteryCapacityKwh) : null,
    });

    const onEdit = (v) => {
        setEditingId(v.id);
        setForm({ ...v });
        setImagePreview(v.imageUrl || null);
        setShowForm(true);
    };

    const onDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa xe này?')) return;
        setDeletingId(id);
        try {
            await deleteVehicle(id);
            await load();
        } catch (e) {
            setError(e.response?.data?.message || e.message || 'Không thể xóa xe');
        } finally {
            setDeletingId(null);
        }
    };

    const onSetDefault = async (id) => {
        setLoading(true);
        try {
            await setDefaultVehicle(id);
            await load();
        } catch (e) {
            setError(e.response?.data?.message || e.message || 'Không thể đặt xe mặc định');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setForm(emptyVehicle);
        setEditingId(null);
        setShowForm(false);
        setError('');
    };

    const handleAddNew = () => {
        setForm(emptyVehicle);
        setEditingId(null);
        setImagePreview(null);
        setShowForm(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
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
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            
            // Store file for upload (you can implement upload API later)
            // For now, we'll use data URL as preview
            setForm({ ...form, imageUrl: URL.createObjectURL(file) });
        }
    };

    const handleImageUrlChange = (e) => {
        const url = e.target.value;
        setForm({ ...form, imageUrl: url });
        if (url) {
            setImagePreview(url);
        }
    };

    const removeImage = () => {
        setForm({ ...form, imageUrl: '' });
        setImagePreview(null);
    };

    return (
        <div className="vehicles-manager">
            {/* Header */}
            <div className="vehicles-header">
                <div>
                    <h3>Danh sách xe của bạn</h3>
                    <p className="vehicles-subtitle">
                        Quản lý thông tin các xe điện của bạn ({vehicles.length} xe)
                    </p>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={handleAddNew}
                    disabled={loading}
                >
                    <i className="fas fa-plus"></i>
                    Thêm xe mới
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="profile-error-banner">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showForm && (
                <div className="vehicle-form-modal-overlay" onClick={handleCancel}>
                    <div className="vehicle-form-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingId ? 'Chỉnh sửa xe' : 'Thêm xe mới'}</h3>
                            <button 
                                className="modal-close-btn"
                                onClick={handleCancel}
                                type="button"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="vehicle-form">
                            <div className="form-field">
                                <label htmlFor="vehicle-name">
                                    Tên xe <span className="required">*</span>
                                </label>
                                <input
                                    id="vehicle-name"
                                    type="text"
                                    placeholder="Ví dụ: Tesla Model 3"
                                    value={form.name}
                                    onChange={(e) => setForm({...form, name: e.target.value})}
                                    required
                                    className="form-control"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-field">
                                <label htmlFor="vehicle-plate">
                                    Biển số xe
                                </label>
                                <input
                                    id="vehicle-plate"
                                    type="text"
                                    placeholder="Ví dụ: 30A-12345"
                                    value={form.plateNumber}
                                    onChange={(e) => setForm({...form, plateNumber: e.target.value})}
                                    className="form-control"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label htmlFor="vehicle-battery">
                                        Dung lượng pin (kWh)
                                    </label>
                                    <input
                                        id="vehicle-battery"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder="Ví dụ: 60"
                                        value={form.batteryCapacityKwh}
                                        onChange={(e) => setForm({...form, batteryCapacityKwh: e.target.value})}
                                        className="form-control"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="vehicle-charger-type">
                                        Loại sạc ưa thích
                                    </label>
                                    <select
                                        id="vehicle-charger-type"
                                        value={form.preferredChargerType}
                                        onChange={(e) => setForm({...form, preferredChargerType: e.target.value})}
                                        className="form-control"
                                        disabled={loading}
                                    >
                                        <option value="AC">AC (Sạc xoay chiều)</option>
                                        <option value="DC">DC (Sạc một chiều)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-field">
                                <label htmlFor="vehicle-image">
                                    Hình ảnh xe
                                </label>
                                <div className="image-upload-section">
                                    {imagePreview ? (
                                        <div className="image-preview-container">
                                            <img src={imagePreview} alt="Vehicle preview" className="image-preview" />
                                            <button 
                                                type="button"
                                                className="btn-remove-image"
                                                onClick={removeImage}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="image-upload-placeholder">
                                            <i className="fas fa-image"></i>
                                            <p>Chưa có ảnh</p>
                                        </div>
                                    )}
                                    <div className="image-upload-controls">
                                        <label htmlFor="vehicle-image-file" className="btn btn-secondary btn-sm">
                                            <i className="fas fa-upload"></i>
                                            Tải ảnh lên
                                        </label>
                                        <input
                                            id="vehicle-image-file"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={loading}
                                            style={{ display: 'none' }}
                                        />
                                        <span className="image-upload-or">hoặc</span>
                                        <input
                                            id="vehicle-image-url"
                                            type="text"
                                            placeholder="Nhập URL ảnh"
                                            value={form.imageUrl || ''}
                                            onChange={handleImageUrlChange}
                                            className="form-control"
                                            disabled={loading}
                                        />
                                    </div>
                                    <p className="form-caption">
                                        Tải lên ảnh từ máy tính hoặc nhập URL ảnh (JPG, PNG, tối đa 5MB)
                                    </p>
                                </div>
                            </div>

                            <div className="form-field">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={!!form.isDefault}
                                        onChange={(e) => setForm({...form, isDefault: e.target.checked})}
                                        disabled={loading}
                                    />
                                    <span>Đặt làm xe mặc định</span>
                                </label>
                                <p className="form-caption">
                                    Xe mặc định sẽ được tự động chọn khi đặt chỗ sạc
                                </p>
                            </div>

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
                                            {editingId ? 'Cập nhật' : 'Thêm xe'}
                                        </>
                                    )}
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Vehicles List */}
            {loading && vehicles.length === 0 ? (
                <div className="vehicles-loading">
                    <div className="spinner"></div>
                    <p>Đang tải danh sách xe...</p>
                </div>
            ) : vehicles.length === 0 ? (
                <div className="vehicles-empty">
                    <div className="empty-icon">
                        <i className="fas fa-car"></i>
                    </div>
                    <h4>Chưa có xe nào</h4>
                    <p>Thêm xe đầu tiên của bạn để bắt đầu sử dụng dịch vụ</p>
                    <button 
                        className="btn btn-primary"
                        onClick={handleAddNew}
                    >
                        <i className="fas fa-plus"></i>
                        Thêm xe mới
                    </button>
                </div>
            ) : (
                <div className="vehicles-grid">
                    {vehicles.map((v) => (
                        <div 
                            key={v.id} 
                            className={`vehicle-card ${v.isDefault ? 'is-default' : ''}`}
                        >
                            {v.isDefault && (
                                <div className="vehicle-badge">
                                    <i className="fas fa-star"></i>
                                    <span>Mặc định</span>
                                </div>
                            )}
                            
                            <div className="vehicle-card-header">
                                <div className="vehicle-image-container">
                                    {v.imageUrl ? (
                                        <img 
                                            src={v.imageUrl} 
                                            alt={v.name || 'Vehicle'} 
                                            className="vehicle-image"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        className="vehicle-icon"
                                        style={{ display: v.imageUrl ? 'none' : 'flex' }}
                                    >
                                        <i className="fas fa-car"></i>
                                    </div>
                                </div>
                                <div className="vehicle-main-info">
                                    <h4 className="vehicle-name">{v.name || 'Chưa có tên'}</h4>
                                    {v.plateNumber && (
                                        <div className="vehicle-plate">
                                            <i className="fas fa-id-card"></i>
                                            {v.plateNumber}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="vehicle-card-body">
                                <div className="vehicle-spec">
                                    {v.batteryCapacityKwh && (
                                        <div className="spec-item">
                                            <i className="fas fa-battery-full"></i>
                                            <span>{v.batteryCapacityKwh} kWh</span>
                                        </div>
                                    )}
                                    <div className="spec-item">
                                        <i className="fas fa-plug"></i>
                                        <span>{v.preferredChargerType || 'AC'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="vehicle-card-footer">
                                {!v.isDefault && (
                                    <button 
                                        className="btn btn-link"
                                        onClick={() => onSetDefault(v.id)}
                                        disabled={loading}
                                        title="Đặt làm xe mặc định"
                                    >
                                        <i className="fas fa-star"></i>
                                        Đặt mặc định
                                    </button>
                                )}
                                <button 
                                    className="btn btn-link"
                                    onClick={() => onEdit(v)}
                                    disabled={loading}
                                    title="Chỉnh sửa"
                                >
                                    <i className="fas fa-edit"></i>
                                    Sửa
                                </button>
                                <button 
                                    className="btn btn-link danger"
                                    onClick={() => onDelete(v.id)}
                                    disabled={loading || deletingId === v.id}
                                    title="Xóa xe"
                                >
                                    {deletingId === v.id ? (
                                        <span className="spinner-small"></span>
                                    ) : (
                                        <i className="fas fa-trash"></i>
                                    )}
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}