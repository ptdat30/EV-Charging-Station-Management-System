// src/App.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet
import './App.css';

function App() {
    return (
        <div className="App">
            {/* Có thể thêm Header, Navbar, Footer chung ở đây */}
            <header>
                <h1>EV Charging Management</h1>
                {/* Navigation links (sẽ thêm sau) */}
            </header>

            <main>
                {/* Outlet sẽ render component tương ứng với route con hiện tại */}
                {/* Ví dụ: Nếu URL là "/", nó render LoginPage */}
                {/* Nếu URL là "/dashboard", nó render DashboardPage */}
                <Outlet />
            </main>

            {/* <footer>Footer content</footer> */}
        </div>
    );
}

export default App;