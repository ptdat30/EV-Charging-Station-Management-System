import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import ErrorBoundary from './components/ErrorBoundary';
import AppRouter from './routes/AppRouter';
import './App.css';

function App() {
  return (
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <div className="App">
              <AppRouter />
            </div>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
  );
}

export default App;