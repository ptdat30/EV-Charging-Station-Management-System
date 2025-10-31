import React, { useEffect, useState } from 'react';
import { getMyTransactionsHistory, getMyVehicles } from '../../../services/userService';

export default function QuickStats() {
    const [stats, setStats] = useState({ sessions: 0, totalCost: 0, vehicles: 0 });

    useEffect(() => {
        const load = async () => {
            try {
                const [hist, veh] = await Promise.all([
                    getMyTransactionsHistory(),
                    getMyVehicles()
                ]);
                const sessions = hist.data?.length || 0;
                // Demo: chưa có chi phí, đặt 0
                const totalCost = 0;
                const vehicles = veh.data?.length || 0;
                setStats({ sessions, totalCost, vehicles });
            } catch {}
        };
        load();
    }, []);

    return (
        <div className="quick-stats">
            <div className="stat-card">
                <div className="stat-title">Tổng số lần sạc</div>
                <div className="stat-value">{stats.sessions}</div>
            </div>
            <div className="stat-card">
                <div className="stat-title">Tổng chi phí</div>
                <div className="stat-value">{stats.totalCost.toLocaleString()} ₫</div>
            </div>
            <div className="stat-card">
                <div className="stat-title">Xe đang sử dụng</div>
                <div className="stat-value">{stats.vehicles}</div>
            </div>
        </div>
    );
}


