import React, { useEffect, useState } from 'react';
import { addVehicle, deleteVehicle, getMyVehicles, setDefaultVehicle, updateVehicle } from '../../../services/userService';

const emptyVehicle = { name: '', plateNumber: '', batteryCapacityKwh: '', preferredChargerType: 'AC', isDefault: false };

export default function VehiclesManager() {
    const [vehicles, setVehicles] = useState([]);
    const [form, setForm] = useState(emptyVehicle);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getMyVehicles();
            setVehicles(data || []);
        } catch (e) {
            setError(e.message || 'Không thể tải danh sách xe');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await updateVehicle(editingId, normalize(form));
            } else {
                await addVehicle(normalize(form));
            }
            setForm(emptyVehicle);
            setEditingId(null);
            await load();
        } catch (e) {
            setError(e.message || 'Lỗi lưu xe');
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
    };

    const onDelete = async (id) => {
        if (!confirm('Xóa xe này?')) return;
        setLoading(true);
        try {
            await deleteVehicle(id);
            await load();
        } finally { setLoading(false); }
    };

    const onSetDefault = async (id) => {
        setLoading(true);
        try {
            await setDefaultVehicle(id);
            await load();
        } finally { setLoading(false); }
    };

    return (
        <div>
            <h3>Quản lý xe</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                    <input placeholder="Tên xe" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
                    <input placeholder="Biển số" value={form.plateNumber} onChange={e=>setForm({...form,plateNumber:e.target.value})} />
                </div>
                <div className="form-row">
                    <input type="number" placeholder="Dung lượng pin (kWh)" value={form.batteryCapacityKwh}
                           onChange={e=>setForm({...form,batteryCapacityKwh:e.target.value})} />
                    <select value={form.preferredChargerType} onChange={e=>setForm({...form,preferredChargerType:e.target.value})}>
                        <option value="AC">AC</option>
                        <option value="DC">DC</option>
                    </select>
                    <label><input type="checkbox" checked={!!form.isDefault} onChange={e=>setForm({...form,isDefault:e.target.checked})} /> Mặc định</label>
                </div>
                <div className="profile-actions">
                    <button className="btn btn-primary" type="submit" disabled={loading}>{editingId ? 'Cập nhật' : 'Thêm xe'}</button>
                    {editingId && <button type="button" className="btn btn-secondary" onClick={()=>{setEditingId(null);setForm(emptyVehicle);}}>Hủy</button>}
                </div>
            </form>

            <div className="vehicle-list">
                {vehicles.map(v => (
                    <div key={v.id} className={`vehicle-card ${v.isDefault ? 'default' : ''}`}>
                        <div className="vehicle-info">
                            <div><strong>{v.name}</strong> {v.isDefault && <span className="badge">Mặc định</span>}</div>
                            <div>Biển số: {v.plateNumber || '-'}</div>
                            <div>Pin: {v.batteryCapacityKwh || '-'} kWh | Sạc ưa thích: {v.preferredChargerType || '-'}</div>
                        </div>
                        <div className="vehicle-actions">
                            {!v.isDefault && <button className="btn btn-link" onClick={()=>onSetDefault(v.id)}>Đặt mặc định</button>}
                            <button className="btn btn-link" onClick={()=>onEdit(v)}>Sửa</button>
                            <button className="btn btn-link danger" onClick={()=>onDelete(v.id)}>Xóa</button>
                        </div>
                    </div>
                ))}
                {vehicles.length === 0 && <div>Chưa có xe nào</div>}
            </div>
        </div>
    );
}


