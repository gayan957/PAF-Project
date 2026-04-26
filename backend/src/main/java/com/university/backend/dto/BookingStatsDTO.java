package com.university.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingStatsDTO {
    private long total;
    private long pending;
    private long approved;
    private long rejected;
    private long cancelled;
    private long todayApproved;
    private long upcomingApproved;
}
