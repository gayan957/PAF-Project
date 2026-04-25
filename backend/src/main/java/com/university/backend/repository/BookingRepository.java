package com.university.backend.repository;

import com.university.backend.model.Booking;
import com.university.backend.model.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Get all bookings by a specific user
    Page<Booking> findByUserEmail(String userEmail, Pageable pageable);

    // Filter by status (for admin)
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    // *** CONFLICT CHECK QUERY ***
    // Find any APPROVED bookings for the same resource that overlap with the requested time
    @Query("""
        SELECT b FROM Booking b
        WHERE b.resource.id = :resourceId
          AND b.status = 'APPROVED'
          AND b.startTime < :endTime
          AND b.endTime > :startTime
    """)
    List<Booking> findConflictingBookings(
        @Param("resourceId") Long resourceId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    // Same conflict check but excluding a specific booking ID (useful for updates)
    @Query("""
        SELECT b FROM Booking b
        WHERE b.resource.id = :resourceId
          AND b.status = 'APPROVED'
          AND b.startTime < :endTime
          AND b.endTime > :startTime
          AND b.id <> :excludeId
    """)
    List<Booking> findConflictingBookingsExcluding(
        @Param("resourceId") Long resourceId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("excludeId") Long excludeId
    );
}
