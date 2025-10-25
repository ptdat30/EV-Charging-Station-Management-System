// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext.jsx'; // Import AuthProvider
import { AppRoutes } from './routes.jsx'; // Import AppRoutes
import './index.css'; // Hoặc global.css

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* AuthProvider bọc ngoài cùng để context có sẵn cho mọi route */}
        <AuthProvider>
            <AppRoutes /> {/* Render component quản lý routes */}
        </AuthProvider>
    </React.StrictMode>
);