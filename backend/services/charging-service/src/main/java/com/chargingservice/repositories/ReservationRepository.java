package com.chargingservice.repositories;

import com.chargingservice.entities.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserIdOrderByReservedStartTimeDesc(Long userId);
    List<Reservation> findByStationIdAndStatus(Long stationId, Reservation.ReservationStatus status);
    Optional<Reservation> findByConfirmationCode(String confirmationCode);
    Optional<Reservation> findByQrCode(String qrCode);

    @Query("SELECT r FROM Reservation r WHERE r.chargerId = :chargerId AND r.status IN :statuses AND r.reservedStartTime < :endTime AND r.reservedEndTime > :startTime")
    List<Reservation> findOverlappingReservations(
            @Param("chargerId") Long chargerId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("statuses") List<Reservation.ReservationStatus> statuses
    );

    // Find reservations needing reminder (starting between start and end, confirmed status, reminder not sent)
    @Query("SELECT r FROM Reservation r WHERE r.reservedStartTime >= :start AND r.reservedStartTime <= :end AND r.status = :status AND (r.reminderSent = false OR r.reminderSent IS NULL)")
    List<Reservation> findByReservedStartTimeBetweenAndStatusAndReminderNotSent(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("status") Reservation.ReservationStatus status
    );

    // Find expired reservations that didn't check in (confirmed status, reservedStartTime before deadline, not checked in)
    @Query("SELECT r FROM Reservation r WHERE r.status = :status AND r.reservedStartTime < :deadline AND (r.isCheckedIn = false OR r.isCheckedIn IS NULL)")
    List<Reservation> findByStatusAndReservedStartTimeBeforeAndNotCheckedIn(
            @Param("status") Reservation.ReservationStatus status,
            @Param("deadline") LocalDateTime deadline
    );
}

