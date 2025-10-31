package com.chargingservice.services;

import com.chargingservice.dtos.CreateReservationRequestDto;
import com.chargingservice.dtos.ReservationResponseDto;
import java.util.List;

public interface ReservationService {
    ReservationResponseDto createReservation(CreateReservationRequestDto requestDto);
    ReservationResponseDto getReservationById(Long reservationId);
    List<ReservationResponseDto> getReservationsByUserId(Long userId);
    ReservationResponseDto cancelReservation(Long reservationId, Long userId, String reason);
    ReservationResponseDto checkIn(Long reservationId, Long userId);
    Object startSessionFromReservation(Long reservationId, Long userId);
}

