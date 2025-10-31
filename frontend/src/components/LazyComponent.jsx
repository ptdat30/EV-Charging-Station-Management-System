// src/components/LazyComponent.jsx
import React, { Suspense } from 'react';
import '../styles/LazyComponent.css';

/**
 * HOC để lazy load component với Suspense
 */
export const withLazyLoading = (Component, Fallback = null) => {
  const LazyComponent = React.lazy(() => Component);
  
  return (props) => (
    <Suspense fallback={Fallback || <div className="loading-spinner">Đang tải...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Loading spinner component
 */
export const LoadingSpinner = ({ size = 'medium', message = 'Đang tải...' }) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  return (
    <div className={`loading-spinner ${sizeClasses[size] || sizeClasses.medium}`}>
      <div className="spinner"></div>
      {message && <p>{message}</p>}
    </div>
  );
};

