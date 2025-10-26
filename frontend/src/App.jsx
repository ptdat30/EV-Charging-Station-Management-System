// src/App.jsx
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './App.css'; // CSS cho layout chung

function App() {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Chuyển về trang login sau khi logout
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>EV Charging</h1>
                <nav>
                    {isLoggedIn ? (
                        <>
                            <Link to="/dashboard">Dashboard</Link>
                            <Link to="/stations">Stations</Link>
                            <Link to="/charging">Charging Test</Link>
                            {/* Thêm link profile, history,... */}
                            <button onClick={handleLogout} className="logout-button">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </nav>
            </header>

            <div className="app-content">
                {/* Sidebar có thể đặt ở đây nếu cần */}
                <main className="main-content">
                    <Outlet /> {/* Nơi nội dung của các trang con được render */}
                </main>
            </div>

            {/* <footer className="app-footer">Footer</footer> */}
        </div>
    );
}

export default App;