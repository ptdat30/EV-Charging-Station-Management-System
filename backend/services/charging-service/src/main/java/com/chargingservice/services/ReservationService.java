package com.chargingservice.services;

import com.chargingservice.dtos.CreateReservationRequestDto;
import com.chargingservice.dtos.ReservationResponseDto;
import com.chargingservice.dtos.RouteBookingRequestDto;
import com.chargingservice.dtos.SessionResponseDto;
import java.util.List;

public interface ReservationService {
    ReservationResponseDto createReservation(CreateReservationRequestDto requestDto);
    ReservationResponseDto getReservationById(Long reservationId);
    List<ReservationResponseDto> getReservationsByUserId(Long userId);
    ReservationResponseDto cancelReservation(Long reservationId, Long userId, String reason);
    // Admin cancel reservation (no userId check)
    ReservationResponseDto adminCancelReservation(Long reservationId, String reason);
    ReservationResponseDto checkIn(Long reservationId, Long userId);
    Object startSessionFromReservation(Long reservationId, Long userId);
    SessionResponseDto startSessionFromQRCode(String qrCode, Long userId);
    // Get all reservations (for admin)
    List<ReservationResponseDto> getAllReservations();
    
    // Route booking methods
    List<ReservationResponseDto> createRouteReservations(Long userId, List<RouteBookingRequestDto.RouteBookingItemDto> bookings);
    void cancelRouteReservation(Long reservationId, Long userId);
}

