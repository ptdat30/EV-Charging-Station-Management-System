import React, { createContext, useContext, useState, useEffect } from 'react';
// Import specific functions and the default client from api.js
import apiClient, { loginUser, registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirects

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // Use 'authToken' for consistency with previous code, or keep 'token' if you prefer
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [user, setUser] = useState(null); // Keep track of user info (optional)
    const [loading, setLoading] = useState(true); // To check initial token validity
    const navigate = useNavigate();

    useEffect(() => {
        // When the component mounts or token changes in localStorage
        if (token) {
            console.log("AuthProvider: Found token, setting default header.");
            // Set token for all future apiClient requests
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Optional: Verify token with backend here to get user info if needed
            // verifyToken(token); // You'd need to implement this API call
            setLoading(false); // Assume token is valid for now if it exists
        } else {
            console.log("AuthProvider: No token found.");
            delete apiClient.defaults.headers.common['Authorization'];
            setUser(null);
            setLoading(false);
        }
    }, [token]); // Rerun effect if token changes

    // Login function - calls API, updates state, saves token, navigates
    const login = async (credentials) => {
        setLoading(true);
        try {
            // Use the imported loginUser function
            const response = await loginUser(credentials);
            const newToken = response.data.token;

            localStorage.setItem('authToken', newToken); // Save token
            setToken(newToken); // Update state
            // Optionally fetch user details after login
            // setUser(fetchedUserDetails);
            setLoading(false);
            navigate('/dashboard'); // Navigate on successful login
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            setLoading(false);
            return {
                success: false,
                error: error.response?.data?.message || error.response?.data || 'Đăng nhập thất bại',
            };
        }
    };

    // Register function - calls API
    const register = async (userData) => {
        setLoading(true);
        try {
            // Use the imported registerUser function
            const response = await registerUser(userData);
            setLoading(false);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Registration failed:', error);
            setLoading(false);
            return {
                success: false,
                error: error.response?.data?.message || error.response?.data || 'Đăng ký thất bại',
            };
        }
    };

    // Logout function - clears state, clears storage, navigates
    const logout = () => {
        console.log("AuthProvider: Logging out.");
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        delete apiClient.defaults.headers.common['Authorization']; // Clear header
        navigate('/'); // Navigate to login
    };

    // Optional: Function to verify token with backend (requires /api/auth/validate or similar)
    // const verifyToken = async (tokenToVerify) => {
    //     try {
    //         // Assuming apiClient is configured to send the token in headers
    //         // const response = await apiClient.get('/auth/validate'); // Adjust endpoint if needed
    //         // setUser(response.data); // Set user info based on validation response
    //         console.log("Token implicitly verified by presence."); // Simplified
    //         setLoading(false);
    //     } catch (error) {
    //         console.error('Token verification failed:', error);
    //         logout(); // Logout if token is invalid
    //     }
    // };

    const value = {
        user,
        token,
        isLoggedIn: !!token, // Derived state: true if token exists
        login,
        register,
        logout,
        loading, // Expose loading state
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} {/* Render children only after initial loading/token check */}
        </AuthContext.Provider>
    );
};