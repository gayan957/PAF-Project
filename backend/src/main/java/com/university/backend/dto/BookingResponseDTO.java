package com.university.backend.dto;

import com.university.backend.model.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder

public class BookingResponseDTO {
     private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceLocation;
    private String userEmail;
    private String userName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer attendees;
    private BookingStatus status;
    private String rejectionReason;
    private String reviewedBy;
    private LocalDateTime reviewedAt;
    private String qrCode;
    private Boolean isCheckedIn;
    private LocalDateTime checkedInAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
