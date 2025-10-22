import React from 'react';
import AppRouter from './routes/AppRouter';
import './styles/global.css'; // Import file CSS global
import MapPage from "./pages/MapPage";


function App() {
    return (
        <div className="App">
            <MapPage />
            <AppRouter />
        </div>
    );
}

export default App;