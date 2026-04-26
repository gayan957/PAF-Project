package com.university.backend.controller;

import com.university.backend.dto.ApiResponse;
import com.university.backend.dto.BookingRequestDTO;
import com.university.backend.dto.BookingResponseDTO;
import com.university.backend.dto.BookingStatsDTO;
import com.university.backend.model.BookingStatus;
import com.university.backend.repository.UserRepository;
import com.university.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    /**
     * POST /api/v1/bookings
     * Any authenticated user can request a booking.
     * Supports both OAuth2 and form-login principals.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> createBooking(
            @Valid @RequestBody BookingRequestDTO request,
            @AuthenticationPrincipal Object principal) {

        String email = extractEmail(principal);
        String name  = extractName(principal, email);

        BookingResponseDTO created = bookingService.createBooking(request, email, name);
        return ResponseEntity
            .created(URI.create("/api/v1/bookings/" + created.getId()))
            .body(ApiResponse.success("Booking request submitted successfully", created));
    }

    /**
     * GET /api/v1/bookings/my
     * Logged-in user sees only their own bookings (most recent first).
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<BookingResponseDTO>>> getMyBookings(
            @AuthenticationPrincipal Object principal,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        String email = extractEmail(principal);
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getMyBookings(email, pageable)));
    }

    /**
     * GET /api/v1/bookings/{id}
     * Get a single booking by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingById(id)));
    }

    /**
     * GET /api/v1/bookings
     * Admin sees ALL bookings with optional filters.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<BookingResponseDTO>>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String resourceName,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @PageableDefault(size = 200, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getAllBookings(status, resourceName, userEmail, from, to, pageable)));
    }

    /**
     * GET /api/v1/bookings/resource/{resourceId}/upcoming?limit=10
     * Returns the next N upcoming approved bookings for a resource.
     * Used by the resource detail page to display the booking schedule.
     */
    @GetMapping("/resource/{resourceId}/upcoming")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getUpcomingBookings(
            @PathVariable Long resourceId,
            @RequestParam(defaultValue = "10") int limit) {

        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getUpcomingBookingsForResource(resourceId, limit)));
    }

    /**
     * GET /api/v1/bookings/resource/{resourceId}/availability?from=...&to=...
     * Returns approved bookings for a resource within a time window.
     * Used by the booking modal to show conflicts before the user submits.
     */
    @GetMapping("/resource/{resourceId}/availability")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getResourceAvailability(
            @PathVariable Long resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getResourceAvailability(resourceId, from, to)));
    }

    /**
     * GET /api/v1/bookings/stats
     * Admin-only summary counts for the dashboard.
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingStatsDTO>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingStats()));
    }

    /**
     * PATCH /api/v1/bookings/{id}/approve
     * Admin approves a PENDING booking. Re-checks conflicts before approving.
     */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal) {

        String adminEmail = extractEmail(principal);
        return ResponseEntity.ok(ApiResponse.success(
            "Booking approved successfully",
            bookingService.approveBooking(id, adminEmail)));
    }

    /**
     * PATCH /api/v1/bookings/{id}/reject
     * Admin rejects a PENDING booking with a mandatory reason.
     */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> reject(
            @PathVariable Long id,
            @RequestParam String reason,
            @AuthenticationPrincipal Object principal) {

        String adminEmail = extractEmail(principal);
        return ResponseEntity.ok(ApiResponse.success(
            "Booking rejected",
            bookingService.rejectBooking(id, reason, adminEmail)));
    }

    /**
     * PATCH /api/v1/bookings/{id}/cancel
     * Owner can cancel their own PENDING or APPROVED booking.
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal Object principal) {

        String email = extractEmail(principal);
        return ResponseEntity.ok(ApiResponse.success(
            "Booking cancelled",
            bookingService.cancelBooking(id, email)));
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Extracts the user's email from either an OAuth2User (Google/GitHub login)
     * or a UserDetails (username+password login).
     */
    private String extractEmail(Object principal) {
        if (principal instanceof OAuth2User oAuth2User) {
            return oAuth2User.getAttribute("email");
        }
        if (principal instanceof UserDetails userDetails) {
            // For form-login, Spring Security stores the email as the username
            return userDetails.getUsername();
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
            "Unable to identify authenticated user");
    }

    /**
     * Extracts the user's display name. For OAuth2 users it comes from the token;
     * for form-login users we look it up from the database.
     */
    private String extractName(Object principal, String email) {
        if (principal instanceof OAuth2User oAuth2User) {
            String name = oAuth2User.getAttribute("name");
            return name != null ? name : email;
        }
        // Form-login: look up the display name stored in our database
        return userRepository.findByEmail(email)
            .map(u -> u.getName() != null ? u.getName() : email)
            .orElse(email);
    }
}
