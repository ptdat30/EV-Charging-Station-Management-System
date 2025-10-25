// src/pages/ChargingPage.jsx
import React, { useEffect, useState } from 'react';
import { startChargingSession, stopChargingSession } from '../services/api';
import apiClient from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './ChargingPage.css';

function ChargingPage() {
    const { isLoggedIn, token } = useAuth();
    const [userId, setUserId] = useState('1');
    const [stationId, setStationId] = useState('1');
    const [chargerId, setChargerId] = useState('1');
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [sessionDetails, setSessionDetails] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete apiClient.defaults.headers.common['Authorization'];
        }
    }, [token]);

    const handleStartSession = async () => {
        if (!isLoggedIn) {
            setError('Please log in first.');
            return;
        }
        setError('');
        setLoading(true);
        setSessionDetails(null);
        setCurrentSessionId(null);

        try {
            const response = await startChargingSession({
                userId: parseInt(userId, 10),
                stationId: parseInt(stationId, 10),
                chargerId: parseInt(chargerId, 10),
            });
            setCurrentSessionId(response.data.sessionId);
            setSessionDetails(response.data);
            console.log('Session Started:', response.data);
        } catch (err) {
            console.error('Failed to start session:', err.response?.data || err.message);
            setError(`Failed to start session: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleStopSession = async () => {
        if (!isLoggedIn || !currentSessionId) return;

        setError('');
        setLoading(true);

        try {
            const response = await stopChargingSession(currentSessionId);
            setSessionDetails(response.data);
            console.log('Session Stopped:', response.data);
            alert(`Session ${currentSessionId} stopped. Energy: ${response.data.energyConsumed} kWh`);
        } catch (err) {
            console.error('Failed to stop session:', err.response?.data || err.message);
            setError(`Failed to stop session: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="charging-page">
            <h2>Test Charging Session</h2>
            {!isLoggedIn && <p className="login-warning">Please log in to start/stop sessions.</p>}

            <div className="session-controls">
                <h3>Start New Session</h3>
                <div className="input-group">
                    <div className="input-field">
                        <label>User ID: </label>
                        <input
                            type="number"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            disabled={loading || !isLoggedIn}
                        />
                    </div>
                    <div className="input-field">
                        <label>Station ID: </label>
                        <input
                            type="number"
                            value={stationId}
                            onChange={(e) => setStationId(e.target.value)}
                            disabled={loading || !isLoggedIn}
                        />
                    </div>
                    <div className="input-field">
                        <label>Charger ID: </label>
                        <input
                            type="number"
                            value={chargerId}
                            onChange={(e) => setChargerId(e.target.value)}
                            disabled={loading || !isLoggedIn}
                        />
                    </div>
                </div>
                <button
                    onClick={handleStartSession}
                    disabled={loading || !isLoggedIn || !!currentSessionId}
                    className="btn btn-primary"
                >
                    {loading ? 'Starting...' : 'Start Session'}
                </button>
                {!!currentSessionId && <span className="active-session">(Session active: {currentSessionId})</span>}
            </div>

            <div className="session-details">
                <h3>Current / Last Session Details</h3>
                {loading && <p>Loading...</p>}
                {error && <p className="error-message">Error: {error}</p>}
                {sessionDetails ? (
                    <pre className="session-data">{JSON.stringify(sessionDetails, null, 2)}</pre>
                ) : (
                    <p>No active session or session details available.</p>
                )}
                {currentSessionId && sessionDetails?.sessionStatus === 'charging' && (
                    <button
                        onClick={handleStopSession}
                        disabled={loading || !isLoggedIn}
                        className="btn btn-secondary"
                    >
                        {loading ? 'Stopping...' : `Stop Session ${currentSessionId}`}
                    </button>
                )}
            </div>
        </div>
    );
}

export default ChargingPage;