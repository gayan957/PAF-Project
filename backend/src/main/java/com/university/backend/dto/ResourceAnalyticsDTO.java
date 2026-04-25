package com.university.backend.dto;

import lombok.*;
import java.util.Map;

@Data
@Builder
public class ResourceAnalyticsDTO {
    private long totalResources;
    private long activeCount;
    private long outOfServiceCount;
    private long underMaintenanceCount;
    private Map<String, Long> countByType;
    private Map<String, Long> countByBuilding;
}