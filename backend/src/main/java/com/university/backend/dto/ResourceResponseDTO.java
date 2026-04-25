package com.university.backend.dto;

import com.university.backend.model.ResourceStatus;
import com.university.backend.model.ResourceType;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
public class ResourceResponseDTO {
    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private String building;
    private String availabilityStart;
    private String availabilityEnd;
    private ResourceStatus status;
    private String description;
    private String imageUrl;
    private String statusReason;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}