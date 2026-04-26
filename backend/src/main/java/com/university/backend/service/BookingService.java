package com.university.backend.service;

import com.university.backend.dto.BookingRequestDTO;
import com.university.backend.dto.BookingResponseDTO;
import com.university.backend.dto.BookingStatsDTO;
import com.university.backend.dto.BookingStatusUpdateDTO;
import com.university.backend.model.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingService {

    // USER: create a new booking request
    BookingResponseDTO createBooking(BookingRequestDTO request, String userEmail, String userName);

    // USER: get my own bookings
    Page<BookingResponseDTO> getMyBookings(String userEmail, Pageable pageable);

    // USER: cancel my own booking
    BookingResponseDTO cancelBooking(Long bookingId, String userEmail);

    // ADMIN: get all bookings with optional filters
    Page<BookingResponseDTO> getAllBookings(
        BookingStatus status,
        String resourceName,
        String userEmail,
        LocalDateTime from,
        LocalDateTime to,
        Pageable pageable
    );

    // ADMIN: approve a booking
    BookingResponseDTO approveBooking(Long bookingId, String adminEmail);

    // ADMIN: reject a booking with a reason
    BookingResponseDTO rejectBooking(Long bookingId, String reason, String adminEmail);

    // BOTH: get single booking by ID
    BookingResponseDTO getBookingById(Long bookingId);

    // BOTH: get approved bookings for a resource in a date range (for availability display)
    List<BookingResponseDTO> getResourceAvailability(Long resourceId, LocalDateTime from, LocalDateTime to);

    // ADMIN: get booking statistics summary
    BookingStatsDTO getBookingStats();

    // BOTH: get next N upcoming approved bookings for a resource (for detail page schedule)
    List<BookingResponseDTO> getUpcomingBookingsForResource(Long resourceId, int limit);
}
