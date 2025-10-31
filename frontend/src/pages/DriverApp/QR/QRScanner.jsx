import React, { useState } from 'react';
import { startSessionFromReservation } from '../../../services/stationService';

// Placeholder: nhập mã QR hoặc reservationId thủ công
export default function QRScanner() {
    const [reservationId, setReservationId] = useState('');
    const [message, setMessage] = useState('');

    const onStart = async () => {
        try {
            setMessage('Đang bắt đầu phiên sạc...');
            const res = await startSessionFromReservation(Number(reservationId));
            setMessage('Bắt đầu phiên sạc thành công. Session ID: ' + (res?.sessionId || '')); 
        } catch (e) {
            setMessage(e.message || 'Không thể bắt đầu');
        }
    };

    return (
        <div style={{maxWidth:600, margin:'2rem auto', background:'#fff', padding:'1rem', borderRadius:12}}>
            <h2>Quét QR để bắt đầu sạc</h2>
            <p>Demo: nhập Reservation ID để bắt đầu.</p>
            <div className="form-row">
                <input placeholder="Reservation ID" value={reservationId} onChange={e=>setReservationId(e.target.value)} />
                <button className="btn btn-primary" onClick={onStart}>Bắt đầu</button>
            </div>
            {message && <div style={{marginTop:'1rem'}}>{message}</div>}
        </div>
    );
}


