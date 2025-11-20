// src/pages/DriverApp/Stations/StationDetailPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StationDetailModal from '../../../components/StationDetailModal';

const StationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/map');
  };

  return (
    <StationDetailModal
      isOpen={true}
      onClose={handleClose}
      stationId={id}
    />
  );
};

export default StationDetailPage;
