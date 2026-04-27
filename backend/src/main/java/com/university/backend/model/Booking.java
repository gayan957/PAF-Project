package com.university.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which resource is being booked
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    // Who made the booking (store email from OAuth)
    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String userName;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private String purpose;

    private Integer attendees;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    // Admin fills these when approving/rejecting
    private String rejectionReason;
    private String reviewedBy;
    private LocalDateTime reviewedAt;

    // QR Code for check-in (generated when approved)
    @Column(columnDefinition = "LONGTEXT")
    private String qrCode;

    // Check-in tracking
    private Boolean isCheckedIn;
    private LocalDateTime checkedInAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
