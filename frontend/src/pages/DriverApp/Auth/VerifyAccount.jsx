import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { addVehicle, updateMyProfile } from '../../../services/userService';

export default function VerifyAccount() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [message, setMessage] = useState('Đang xác minh tài khoản...');

    useEffect(() => {
        const doVerify = async () => {
            // Demo: coi như email/SMS đã xác minh thành công
            try {
                const state = location.state || {};
                const email = state.email;
                const password = state.password;
                const vehicle = state.vehicle;
                const defaultPaymentMethod = state.defaultPaymentMethod;

                // 1) Đăng nhập tự động sau xác minh
                const result = await login(email, password);
                if (!result?.success) {
                    setMessage('Không thể đăng nhập sau khi xác minh. Vui lòng đăng nhập thủ công.');
                    return setTimeout(()=>navigate('/login'), 1500);
                }

                // 2) Tạo xe mặc định nếu có
                if (vehicle && (vehicle.name || vehicle.batteryCapacityKwh)) {
                    try { await addVehicle(vehicle); } catch {}
                }

                // 3) Lưu phương thức thanh toán mặc định vào profile
                if (defaultPaymentMethod) {
                    try { await updateMyProfile({ preferredPaymentMethod: defaultPaymentMethod }); } catch {}
                }

                setMessage('Xác minh thành công! Đang chuyển về trang chủ...');
                setTimeout(()=> navigate('/'), 1000);
            } catch (e) {
                setMessage('Lỗi xác minh. Vui lòng thử lại.');
            }
        };
        doVerify();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{minHeight:'50vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <div>
                <div style={{textAlign:'center',marginBottom:'1rem'}}>
                    <i className="fas fa-shield-check" style={{fontSize:'48px',color:'#22c55e'}}></i>
                </div>
                <p style={{textAlign:'center',fontSize:'18px'}}>{message}</p>
            </div>
        </div>
    );
}


