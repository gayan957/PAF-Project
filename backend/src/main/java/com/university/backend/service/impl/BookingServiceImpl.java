package com.university.backend.service.impl;

import com.university.backend.dto.BookingRequestDTO;
import com.university.backend.dto.BookingResponseDTO;
import com.university.backend.dto.BookingStatsDTO;
import com.university.backend.dto.BookingStatusUpdateDTO;
import com.university.backend.model.*;
import com.university.backend.repository.BookingRepository;
import com.university.backend.repository.ResourceRepository;
import com.university.backend.repository.UserRepository;
import com.university.backend.service.BookingService;
import com.university.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

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

        BookingResponseDTO result = toDTO(bookingRepository.save(booking));

        notificationService.sendNotificationToAllAdmins(
            NotificationType.ADMIN_BOOKING_CREATED,
            "New Booking Request",
            userName + " requested \"" + resource.getName() + "\" from " +
                request.getStartTime().toLocalDate() + " to " + request.getEndTime().toLocalDate() + ".",
            result.getId(), "BOOKING"
        );

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponseDTO> getMyBookings(String userEmail, Pageable pageable) {
        return bookingRepository.findByUserEmailOrderByCreatedAtDesc(userEmail, pageable)
            .map(this::toDTO);
    }

    @Override
    public BookingResponseDTO cancelBooking(Long bookingId, String userEmail) {
        Booking booking = findBookingById(bookingId);

        if (!booking.getUserEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "You can only cancel your own bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING
                && booking.getStatus() != BookingStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Cannot cancel a booking with status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        BookingResponseDTO result = toDTO(bookingRepository.save(booking));

        notificationService.sendNotificationToAllAdmins(
            NotificationType.ADMIN_BOOKING_CANCELLED,
            "Booking Cancelled",
            booking.getUserName() + " cancelled their booking for \"" +
                booking.getResource().getName() + "\".",
            booking.getId(), "BOOKING"
        );

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponseDTO> getAllBookings(BookingStatus status, String resourceName,
            String userEmail, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        return bookingRepository.findByFilters(status, resourceName, userEmail, from, to, pageable)
            .map(this::toDTO);
    }

    @Override
    public BookingResponseDTO approveBooking(Long bookingId, String adminEmail) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Only PENDING bookings can be approved. Current status: " + booking.getStatus());
        }

        // Re-check conflicts before approving (race condition guard)
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

        BookingResponseDTO result = toDTO(bookingRepository.save(booking));

        userRepository.findByEmail(booking.getUserEmail()).ifPresentOrElse(user ->
            notificationService.sendNotification(
                user,
                NotificationType.BOOKING_APPROVED,
                "Booking Approved",
                "Your booking for \"" + booking.getResource().getName() + "\" has been approved.",
                booking.getId(), "BOOKING"
            ),
            () -> log.warn("Could not notify: user not found for email {}", booking.getUserEmail())
        );

        return result;
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

        BookingResponseDTO result = toDTO(bookingRepository.save(booking));

        userRepository.findByEmail(booking.getUserEmail()).ifPresentOrElse(user ->
            notificationService.sendNotification(
                user,
                NotificationType.BOOKING_REJECTED,
                "Booking Rejected",
                "Your booking for \"" + booking.getResource().getName() + "\" was rejected. Reason: " + reason,
                booking.getId(), "BOOKING"
            ),
            () -> log.warn("Could not notify: user not found for email {}", booking.getUserEmail())
        );

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Long bookingId) {
        return toDTO(findBookingById(bookingId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getResourceAvailability(Long resourceId, LocalDateTime from, LocalDateTime to) {
        return bookingRepository.findApprovedBookingsForResource(resourceId, from, to)
            .stream().map(this::toDTO).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingStatsDTO getBookingStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        return BookingStatsDTO.builder()
            .total(bookingRepository.count())
            .pending(bookingRepository.countByStatus(BookingStatus.PENDING))
            .approved(bookingRepository.countByStatus(BookingStatus.APPROVED))
            .rejected(bookingRepository.countByStatus(BookingStatus.REJECTED))
            .cancelled(bookingRepository.countByStatus(BookingStatus.CANCELLED))
            .todayApproved(bookingRepository.countTodayApprovedBookings(startOfDay, endOfDay))
            .upcomingApproved(bookingRepository.countUpcomingApproved(now))
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getUpcomingBookingsForResource(Long resourceId, int limit) {
        return bookingRepository
            .findUpcomingApprovedForResource(resourceId, LocalDateTime.now(), PageRequest.of(0, limit))
            .stream().map(this::toDTO).toList();
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
