package com.university.backend.dto;

import com.university.backend.model.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketRequest {
    private String category;
    private String description;
    private String priority;
    private TicketStatus status;
    private String location;
    private String contactInfo;
    private Long assignedTechnicianId;
}
