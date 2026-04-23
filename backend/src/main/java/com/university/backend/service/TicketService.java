package com.university.backend.service;

import com.university.backend.dto.TicketRequest;
import com.university.backend.model.Ticket;
import com.university.backend.model.TicketStatus;
import com.university.backend.model.User;
import com.university.backend.repository.TicketRepository;
import com.university.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Transactional
    public Ticket createTicket(TicketRequest request, User creator) {
        Ticket ticket = Ticket.builder()
                .category(request.getCategory())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(request.getStatus() != null ? request.getStatus() : TicketStatus.OPEN)
                .location(request.getLocation())
                .contactInfo(request.getContactInfo())
                .createdBy(creator)
                .build();
        
        if (request.getAssignedTechnicianId() != null) {
            User technician = userRepository.findById(request.getAssignedTechnicianId())
                    .orElseThrow(() -> new RuntimeException("Technician not found"));
            ticket.setAssignedTechnician(technician);
        }

        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + id));
    }

    @Transactional
    public Ticket updateTicket(Long id, TicketRequest request) {
        Ticket ticket = getTicketById(id);
        
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(request.getStatus());
        ticket.setLocation(request.getLocation());
        ticket.setContactInfo(request.getContactInfo());
        
        if (request.getAssignedTechnicianId() != null) {
            User technician = userRepository.findById(request.getAssignedTechnicianId())
                    .orElseThrow(() -> new RuntimeException("Technician not found"));
            ticket.setAssignedTechnician(technician);
        } else {
            ticket.setAssignedTechnician(null);
        }
        
        return ticketRepository.save(ticket);
    }

    @Transactional
    public void deleteTicket(Long id) {
        Ticket ticket = getTicketById(id);
        ticketRepository.delete(ticket);
    }

    @Transactional
    public Ticket updateStatus(Long id, TicketStatus status) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(status);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket assignTechnician(Long id, Long technicianId) {
        Ticket ticket = getTicketById(id);
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found with id: " + technicianId));
        ticket.setAssignedTechnician(technician);
        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket resolveTicket(Long id, String notes) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionNotes(notes);
        return ticketRepository.save(ticket);
    }
}
