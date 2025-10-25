// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllUsers } from '../services/api';
import './DashboardPage.css';

function DashboardPage() {
    const { token, logout, isLoggedIn } = useAuth();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            logout();
        } else {
            fetchUserData(token);
        }
    }, [isLoggedIn, token, logout]);

    const fetchUserData = async (currentToken) => {
        if (!currentToken) return;
        setLoading(true);
        setError(null);
        try {
            const response = await getAllUsers(currentToken);
            setUserData(response.data);
        } catch (err) {
            console.error('Failed to fetch user data:', err);
            setError('Failed to load dashboard data.');
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h2>Dashboard</h2>
                <p>Welcome! You are logged in.</p>
            </div>

            {loading && <div className="loading">Loading data...</div>}
            {error && <div className="error-message">{error}</div>}

            {userData && (
                <div className="user-data-section">
                    <h3>User List (Example Data):</h3>
                    <div className="data-container">
                        <pre>{JSON.stringify(userData, null, 2)}</pre>
                    </div>
                </div>
            )}

            <div className="dashboard-actions">
                <button onClick={logout} className="btn btn-secondary">
                    Logout
                </button>
            </div>
        </div>
    );
}

export default DashboardPage;