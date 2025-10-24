// src/components/Footer.jsx

import React, { useEffect } from "react";
import '../styles/footer.css';
const Footer = () => {
    return (
        <nav className="bottom-nav">
            <a href="#" className="nav-item active">
                <i className="fas fa-map"></i>
                <span>Bản đồ</span>
            </a>
            <a href="#" className="nav-item">
                <i className="fas fa-heart"></i>
                <span>Yêu thích</span>
            </a>
            <a href="#" className="nav-item">
                <i className="fas fa-clock"></i>
                <span>Lịch sử</span>
            </a>
            <a href="#" className="nav-item">
                <i className="fas fa-user"></i>
                <span>Tài khoản</span>
            </a>
        </nav>
    );
};

export default Footer;