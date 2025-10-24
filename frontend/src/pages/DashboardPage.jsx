// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // No longer need useNavigate here
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook
import { getAllUsers } from '../services/api';

function DashboardPage() {
    // const navigate = useNavigate(); // Remove
    const { token, logout, isLoggedIn } = useAuth(); // Get state and functions from contexts
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Check login status on mount
    useEffect(() => {
        if (!isLoggedIn) {
            logout(); // Use contexts's logout which handles navigation
        } else {
            fetchUserData(token); // Fetch data if logged in
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, token]); // Depend on isLoggedIn and token

    const fetchUserData = async (currentToken) => {
        if (!currentToken) return; // Don't fetch if token is somehow null
        setLoading(true);
        setError(null);
        try {
            const response = await getAllUsers(currentToken);
            setUserData(response.data);
        } catch (err) {
            console.error('Failed to fetch user data:', err);
            setError('Failed to load dashboard data.');
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout(); // Use contexts's logout
            }
        } finally {
            setLoading(false);
        }
    };

    // Logout button now just calls the contexts's logout function
    return (
        <div>
            <h2>Dashboard</h2>
            <p>Welcome! You are logged in.</p>
            {loading && <p>Loading data...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {userData && (
                <div>
                    <h3>User List (Example Data):</h3>
                    <pre>{JSON.stringify(userData, null, 2)}</pre>
                </div>
            )}
            <button onClick={logout}>Logout</button> {/* Use contexts's logout */}
        </div>
    );
}

export default DashboardPage;