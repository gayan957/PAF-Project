package com.university.backend.service.impl;

import com.university.backend.dto.BookingRequestDTO;
import com.university.backend.dto.BookingResponseDTO;
import com.university.backend.dto.BookingStatusUpdateDTO;
import com.university.backend.model.*;
import com.university.backend.repository.BookingRepository;
import com.university.backend.repository.ResourceRepository;
import com.university.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO request, String userEmail, String userName) {

        // 1. Validate time range
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "End time must be after start time");
        }

        // 2. Find the resource
        Resource resource = resourceRepository.findById(request.getResourceId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Resource not found with id: " + request.getResourceId()));

        // 3. Check resource is ACTIVE
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Resource is not available for booking. Current status: " + resource.getStatus());
        }

        // 4. Check capacity
        if (request.getAttendees() != null && resource.getCapacity() != null
                && request.getAttendees() > resource.getCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Number of attendees (" + request.getAttendees() +
                ") exceeds resource capacity (" + resource.getCapacity() + ")");
        }

        // 5. *** CONFLICT CHECK ***
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            resource.getId(),
            request.getStartTime(),
            request.getEndTime()
        );
        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "This resource already has an approved booking that overlaps with your requested time slot.");
        }

        // 6. Create and save the booking
        Booking booking = Booking.builder()
            .resource(resource)
            .userEmail(userEmail)
            .userName(userName)
            .startTime(request.getStartTime())
            .endTime(request.getEndTime())
            .purpose(request.getPurpose())
            .attendees(request.getAttendees())
            .status(BookingStatus.PENDING)
            .build();

        return toDTO(bookingRepository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponseDTO> getMyBookings(String userEmail, Pageable pageable) {
        return bookingRepository.findByUserEmail(userEmail, pageable)
            .map(this::toDTO);
    }

    @Override
    public BookingResponseDTO cancelBooking(Long bookingId, String userEmail) {
        Booking booking = findBookingById(bookingId);

        // Only the owner can cancel their booking
        if (!booking.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "You can only cancel your own bookings");
        }

        // Can only cancel PENDING or APPROVED bookings
        if (booking.getStatus() != BookingStatus.PENDING
                && booking.getStatus() != BookingStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Cannot cancel a booking with status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return toDTO(bookingRepository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponseDTO> getAllBookings(BookingStatus status, Pageable pageable) {
        if (status != null) {
            return bookingRepository.findByStatus(status, pageable).map(this::toDTO);
        }
        return bookingRepository.findAll(pageable).map(this::toDTO);
    }

    @Override
    public BookingResponseDTO approveBooking(Long bookingId, String adminEmail) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Only PENDING bookings can be approved. Current status: " + booking.getStatus());
        }

        // Re-check conflicts before approving (another booking might have been approved since)
        List<Booking> conflicts = bookingRepository.findConflictingBookingsExcluding(
            booking.getResource().getId(),
            booking.getStartTime(),
            booking.getEndTime(),
            bookingId
        );
        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Cannot approve: a conflicting booking has already been approved for this time slot.");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewedBy(adminEmail);
        booking.setReviewedAt(LocalDateTime.now());

        return toDTO(bookingRepository.save(booking));
    }

    @Override
    public BookingResponseDTO rejectBooking(Long bookingId, String reason, String adminEmail) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Only PENDING bookings can be rejected. Current status: " + booking.getStatus());
        }

        if (reason == null || reason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "A rejection reason is required");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setReviewedBy(adminEmail);
        booking.setReviewedAt(LocalDateTime.now());

        return toDTO(bookingRepository.save(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Long bookingId) {
        return toDTO(findBookingById(bookingId));
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private Booking findBookingById(Long id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Booking not found with id: " + id));
    }

    private BookingResponseDTO toDTO(Booking b) {
        return BookingResponseDTO.builder()
            .id(b.getId())
            .resourceId(b.getResource().getId())
            .resourceName(b.getResource().getName())
            .resourceLocation(b.getResource().getLocation())
            .userEmail(b.getUserEmail())
            .userName(b.getUserName())
            .startTime(b.getStartTime())
            .endTime(b.getEndTime())
            .purpose(b.getPurpose())
            .attendees(b.getAttendees())
            .status(b.getStatus())
            .rejectionReason(b.getRejectionReason())
            .reviewedBy(b.getReviewedBy())
            .reviewedAt(b.getReviewedAt())
            .createdAt(b.getCreatedAt())
            .updatedAt(b.getUpdatedAt())
            .build();
    }
}
