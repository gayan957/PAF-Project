package com.university.backend.dto;

import com.university.backend.model.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data

public class BookingStatusUpdateDTO {
    @NotNull(message = "Status is required")
    private BookingStatus status;

    // Required only when rejecting
    private String reason;
}
