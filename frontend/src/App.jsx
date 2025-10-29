import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import AppRouter from './routes/AppRouter';
import './App.css';

function App() {
  return (
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRouter />
          </div>
        </Router>
      </AuthProvider>
  );
}

export default App;