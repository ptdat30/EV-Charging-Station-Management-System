// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx'; // Import AuthProvider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            {/* Wrap everything inside AuthProvider */}
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<App />}>
                        <Route index element={<LoginPage />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        {/* Other routes */}
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);