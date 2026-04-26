package com.university.backend.dto;

import com.university.backend.model.ResourceStatus;
import com.university.backend.model.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ResourceRequestDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String building;

    @NotBlank(message = "Availability start time is required")
    private String availabilityStart;

    @NotBlank(message = "Availability end time is required")
    private String availabilityEnd;

    @NotNull(message = "Status is required")
    private ResourceStatus status;

    private String description;

    private String imageUrl;

    private List<String> imageUrls;
}
