package com.university.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceAvailabilityWindowDTO {

    @NotBlank(message = "Day is required")
    private String day;

    @NotBlank(message = "Opening time is required")
    private String openingTime;

    @NotBlank(message = "Closing time is required")
    private String closingTime;
}
