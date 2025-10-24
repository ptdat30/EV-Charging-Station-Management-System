// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the contexts
const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('authToken')); // Initialize from localStorage
    const navigate = useNavigate();

    // Effect to update localStorage when token changes
    useEffect(() => {
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }, [token]);

    // Login function updates token and navigates
    const login = (newToken) => {
        setToken(newToken);
        navigate('/dashboard'); // Navigate after setting token
    };

    // Logout function clears token and navigates
    const logout = () => {
        setToken(null);
        navigate('/'); // Navigate to login page
    };

    // Value provided by the contexts
    const value = {
        token,
        isLoggedIn: !!token, // Boolean flag for convenience
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily use the auth contexts
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext);
};