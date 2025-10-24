import React from "react";
import Header from "./components/header";
import Footer from "./components/footer";
import HomePage from "./components/HomePage";
// hoặc MapPage nếu bạn muốn hiện bản đồ
// import MapPage from "./components/MapPage";
import "./styles/global.css";
import "./styles/header.css";
import "./styles/footer.css";
import "./styles/homepage.css";

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <HomePage />
        {/* <MapPage /> nếu bạn muốn hiện trang bản đồ thay vì homepage */}
      </main>
      <Footer />
    </div>
  );
}

export default App;