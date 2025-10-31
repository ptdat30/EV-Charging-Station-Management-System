// src/components/LazyChart.jsx
import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from './LazyComponent';

// Lazy load entire Recharts library
const RechartsBundle = lazy(() => import('recharts'));

/**
 * Lazy-loaded Energy Usage Chart component
 * Reduces initial bundle size by loading Recharts only when needed
 */
export const LazyEnergyChart = ({ data }) => {
  return (
    <Suspense fallback={<LoadingSpinner size="medium" message="Đang tải biểu đồ..." />}>
      <ChartRenderer data={data || []} />
    </Suspense>
  );
};

// Internal component that renders chart after Recharts loads
const ChartRenderer = ({ data }) => {
  const [Recharts, setRecharts] = React.useState(null);

  React.useEffect(() => {
    import('recharts').then(rechartsModule => {
      setRecharts(rechartsModule);
    });
  }, []);

  if (!Recharts) {
    return <LoadingSpinner size="medium" message="Đang tải biểu đồ..." />;
  }

  const {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
  } = Recharts;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" />
        <XAxis dataKey="day" stroke="#666" />
        <YAxis stroke="#10b981" />
        <Tooltip 
          contentStyle={{ 
            borderRadius: 12, 
            border: 'none', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)' 
          }} 
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="usage" 
          stroke="#10b981" 
          strokeWidth={3} 
          name="kWh" 
          dot={{ fill: '#10b981', r: 6 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

