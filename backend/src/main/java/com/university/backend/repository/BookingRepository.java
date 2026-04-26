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

    // Get all bookings by a specific user (most recent first)
    Page<Booking> findByUserEmailOrderByCreatedAtDesc(String userEmail, Pageable pageable);

    // Keep the original for compatibility
    Page<Booking> findByUserEmail(String userEmail, Pageable pageable);

    // Filter by status (for admin)
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    // Count by status (used for stats)
    long countByStatus(BookingStatus status);

    // Filter bookings for admin search and optional date range filters
    @Query("""
        SELECT b FROM Booking b
        WHERE (:status IS NULL OR b.status = :status)
          AND (:resourceName IS NULL OR LOWER(b.resource.name) LIKE LOWER(CONCAT('%', :resourceName, '%')))
          AND (:userEmail IS NULL OR LOWER(b.userEmail) LIKE LOWER(CONCAT('%', :userEmail, '%')))
          AND (:fromDate IS NULL OR b.startTime >= :fromDate)
          AND (:toDate IS NULL OR b.endTime <= :toDate)
        ORDER BY b.createdAt DESC
    """)
    Page<Booking> findByFilters(
        @Param("status") BookingStatus status,
        @Param("resourceName") String resourceName,
        @Param("userEmail") String userEmail,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate,
        Pageable pageable
    );

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

    // Same conflict check but excluding a specific booking ID (used when re-checking on approval)
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

    // Approved bookings for a resource in a date range (for availability display in the booking modal)
    @Query("""
        SELECT b FROM Booking b
        WHERE b.resource.id = :resourceId
          AND b.status = 'APPROVED'
          AND b.startTime < :endTime
          AND b.endTime > :startTime
        ORDER BY b.startTime
    """)
    List<Booking> findApprovedBookingsForResource(
        @Param("resourceId") Long resourceId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    // Count approved bookings starting today (for admin stats)
    @Query("""
        SELECT COUNT(b) FROM Booking b
        WHERE b.status = 'APPROVED'
          AND b.startTime >= :startOfDay
          AND b.startTime < :endOfDay
    """)
    long countTodayApprovedBookings(
        @Param("startOfDay") LocalDateTime startOfDay,
        @Param("endOfDay") LocalDateTime endOfDay
    );

    // Count upcoming approved bookings (start time in the future)
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'APPROVED' AND b.startTime > :now")
    long countUpcomingApproved(@Param("now") LocalDateTime now);

    // Next N upcoming approved bookings for a resource (for detail page schedule panel)
    @Query("""
        SELECT b FROM Booking b
        WHERE b.resource.id = :resourceId
          AND b.status = 'APPROVED'
          AND b.startTime > :now
        ORDER BY b.startTime ASC
    """)
    List<Booking> findUpcomingApprovedForResource(
        @Param("resourceId") Long resourceId,
        @Param("now") LocalDateTime now,
        Pageable pageable
    );
}
