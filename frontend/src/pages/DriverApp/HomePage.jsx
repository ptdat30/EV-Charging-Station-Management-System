import "../../styles/HomePage.css";
import carImage from "../../assets/images/charging_bg.png";

export default function HomePage() {
    return (
        <div className="homepage">
            <div
                className="hero-background"
                style={{ backgroundImage: `url(${carImage})` }}
            >
                <div className="overlay">
                    <header className="navbar">
                        <div className="logo">⚡ EVCharge</div>
                        <nav className="nav-links">
                            <a href="#">Trang chủ</a>
                            <a href="#">Tìm trạm sạc</a>
                            <a href="#">Đánh giá</a>
                        </nav>
                        <div className="auth-buttons">
                            <button className="btn-outline">Đăng nhập</button>
                            <button className="btn-primary">Đăng ký</button>
                        </div>
                    </header>

                    <div className="hero-content">
                        <h1>Tìm và đặt trạm sạc xe điện dễ dàng</h1>
                        <p>
                            Khám phá mạng lưới trạm sạc rộng khắp để thuận tiện trên hành trình của bạn.
                        </p>
                        <div className="search-bar">
                            <input type="text" placeholder="Nhập địa điểm của bạn..." />
                            <button>Tìm kiếm</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
