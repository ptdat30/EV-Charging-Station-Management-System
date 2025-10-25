// src/App.jsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
    const { isLoggedIn, logout } = useAuth();
    const location = useLocation();

    return (
        <div className="App">
            <header className="app-header">
                <h1>EV Charging Management</h1>
                <nav className="app-nav">
                    {isLoggedIn ? (
                        <>
                            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
                                Dashboard
                            </Link>
                            <Link to="/charging" className={location.pathname === '/charging' ? 'active' : ''}>
                                Charging Test
                            </Link>
                            <Link to="/station/1" className={location.pathname.includes('/station') ? 'active' : ''}>
                                Station Details
                            </Link>
                            <button onClick={logout} className="logout-btn">
                                Logout
                            </button>
                        </>
                    ) : (
                        <span>Please log in</span>
                    )}
                </nav>
            </header>

            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
}

export default App;