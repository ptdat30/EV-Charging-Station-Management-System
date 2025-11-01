// src/pages/StaffPage.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StaffLayout from '../components/staff/StaffLayout';
import StaffDashboard from '../components/staff/StaffDashboard';

import SessionManagement from '../components/staff/SessionManagement';
import OnSitePayment from '../components/staff/OnSitePayment';
import ChargingPointMonitoring from '../components/staff/ChargingPointMonitoring';
import IncidentReport from '../components/staff/IncidentReport';

const StaffPage = () => {
  React.useEffect(() => {
    console.log('👤 StaffPage mounted');
  }, []);

  return (
    <StaffLayout>
      <Routes>
        <Route index element={<StaffDashboard />} />
        <Route path="sessions" element={<SessionManagement />} />
        <Route path="payment" element={<OnSitePayment />} />
        <Route path="monitoring" element={<ChargingPointMonitoring />} />
        <Route path="incidents" element={<IncidentReport />} />
        <Route path="*" element={<Navigate to="/staff" replace />} />
      </Routes>
    </StaffLayout>
  );
};

export default StaffPage;

