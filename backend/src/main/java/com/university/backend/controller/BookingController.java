package com.university.backend.controller;

import com.university.backend.dto.ApiResponse;
import com.university.backend.dto.BookingRequestDTO;
import com.university.backend.dto.BookingResponseDTO;
import com.university.backend.model.BookingStatus;
import com.university.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * POST /api/v1/bookings
     * Any authenticated user can request a booking
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> createBooking(
            @Valid @RequestBody BookingRequestDTO request,
            @AuthenticationPrincipal OAuth2User principal) {

        String email = principal.getAttribute("email");
        String name  = principal.getAttribute("name");

        BookingResponseDTO created = bookingService.createBooking(request, email, name);
        return ResponseEntity
            .created(URI.create("/api/v1/bookings/" + created.getId()))
            .body(ApiResponse.success("Booking request submitted successfully", created));
    }

    /**
     * GET /api/v1/bookings/my
     * Logged-in user sees only their own bookings
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<BookingResponseDTO>>> getMyBookings(
            @AuthenticationPrincipal OAuth2User principal,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        String email = principal.getAttribute("email");
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getMyBookings(email, pageable)));
    }

    /**
     * GET /api/v1/bookings/{id}
     * Get a single booking by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingById(id)));
    }

    /**
     * GET /api/v1/bookings
     * Admin sees ALL bookings, with optional ?status=PENDING filter
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<BookingResponseDTO>>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {

        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getAllBookings(status, pageable)));
    }

    /**
     * PATCH /api/v1/bookings/{id}/approve
     * Admin approves a PENDING booking
     */
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> approve(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User principal) {

        String adminEmail = principal.getAttribute("email");
        return ResponseEntity.ok(ApiResponse.success(
            "Booking approved successfully",
            bookingService.approveBooking(id, adminEmail)));
    }

    /**
     * PATCH /api/v1/bookings/{id}/reject
     * Admin rejects a PENDING booking with a reason
     */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> reject(
            @PathVariable Long id,
            @RequestParam String reason,
            @AuthenticationPrincipal OAuth2User principal) {

        String adminEmail = principal.getAttribute("email");
        return ResponseEntity.ok(ApiResponse.success(
            "Booking rejected",
            bookingService.rejectBooking(id, reason, adminEmail)));
    }

    /**
     * PATCH /api/v1/bookings/{id}/cancel
     * Owner can cancel their own PENDING or APPROVED booking
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User principal) {

        String email = principal.getAttribute("email");
        return ResponseEntity.ok(ApiResponse.success(
            "Booking cancelled",
            bookingService.cancelBooking(id, email)));
    }
}
