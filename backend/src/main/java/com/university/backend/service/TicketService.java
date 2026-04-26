package com.university.backend.service;

import com.university.backend.dto.TicketRequest;
import com.university.backend.model.Attachment;
import com.university.backend.model.NotificationType;
import com.university.backend.model.Ticket;
import com.university.backend.model.TicketStatus;
import com.university.backend.model.User;
import com.university.backend.repository.AttachmentRepository;
import com.university.backend.repository.TicketRepository;
import com.university.backend.repository.UserRepository;
import com.university.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final AttachmentRepository attachmentRepository;
    private final NotificationService notificationService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

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
                .expectedResolutionTime(calculateExpectedResolutionTime(request.getPriority()))
                .build();
        
        if (request.getAssignedTechnicianId() != null) {
            User technician = userRepository.findById(request.getAssignedTechnicianId())
                    .orElseThrow(() -> new RuntimeException("Technician not found"));
            ticket.setAssignedTechnician(technician);
        }

        Ticket saved = ticketRepository.save(ticket);

        notificationService.sendNotificationToAllAdmins(
            NotificationType.ADMIN_TICKET_CREATED,
            "New Ticket Submitted",
            creator.getName() + " submitted a new " + request.getPriority() + " priority ticket: \"" +
                request.getCategory() + "\".",
            saved.getId(), "TICKET"
        );

        return saved;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Ticket> getTicketsByUser(User user) {
        return ticketRepository.findByCreatedByOrderByCreatedAtDesc(user);
    }

    public List<Ticket> getTicketsByTechnician(User technician) {
        return ticketRepository.findByAssignedTechnicianOrderByCreatedAtDesc(technician);
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

        Ticket saved = ticketRepository.save(ticket);

        notificationService.sendNotificationToAllAdmins(
            NotificationType.ADMIN_TICKET_UPDATED,
            "Ticket Updated",
            ticket.getCreatedBy().getName() + " updated ticket \"" + saved.getCategory() +
                "\" (status: " + saved.getStatus().name().replace('_', ' ') + ").",
            saved.getId(), "TICKET"
        );

        return saved;
    }

    @Transactional
    public void deleteTicket(Long id) {
        Ticket ticket = getTicketById(id);
        ticketRepository.delete(ticket);
    }

    @Transactional
    public Ticket updateStatus(Long id, TicketStatus status) {
        Ticket ticket = getTicketById(id);

        if ((status == TicketStatus.RESOLVED || status == TicketStatus.CLOSED) && ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(java.time.LocalDateTime.now());
        }

        ticket.setStatus(status);
        Ticket saved = ticketRepository.save(ticket);

        notificationService.sendNotification(
            saved.getCreatedBy(),
            NotificationType.TICKET_STATUS_UPDATED,
            "Ticket Status Updated",
            "Your ticket \"" + saved.getCategory() + "\" status changed to " + status.name().replace('_', ' '),
            saved.getId(), "TICKET"
        );

        return saved;
    }

    @Transactional
    public Ticket assignTechnician(Long id, Long technicianId) {
        Ticket ticket = getTicketById(id);
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found with id: " + technicianId));
        ticket.setAssignedTechnician(technician);

        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        Ticket saved = ticketRepository.save(ticket);

        notificationService.sendNotification(
            technician,
            NotificationType.TICKET_ASSIGNED,
            "New Ticket Assigned",
            "Ticket \"" + saved.getCategory() + "\" has been assigned to you.",
            saved.getId(), "TICKET"
        );

        return saved;
    }

    @Transactional
    public Ticket resolveTicket(Long id, String notes) {
        Ticket ticket = getTicketById(id);

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolutionNotes(notes);

        if (ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(java.time.LocalDateTime.now());
        }

        Ticket saved = ticketRepository.save(ticket);

        notificationService.sendNotification(
            saved.getCreatedBy(),
            NotificationType.TICKET_STATUS_UPDATED,
            "Ticket Resolved",
            "Your ticket \"" + saved.getCategory() + "\" has been resolved.",
            saved.getId(), "TICKET"
        );

        return saved;
    }

    @Transactional
    public List<Attachment> addAttachments(Long ticketId, MultipartFile[] files) throws IOException {
        if (files.length > 3) {
            throw new RuntimeException("Maximum 3 files allowed");
        }

        Ticket ticket = getTicketById(ticketId);
        List<Attachment> attachments = new ArrayList<>();

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        for (MultipartFile file : files) {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            Attachment attachment = Attachment.builder()
                    .fileName(fileName)
                    .filePath(filePath.toString())
                    .fileType(file.getContentType())
                    .ticket(ticket)
                    .build();
            
            attachments.add(attachmentRepository.save(attachment));
        }

        return attachments;
    }

    private java.time.LocalDateTime calculateExpectedResolutionTime(String priority) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (priority == null) return now.plusDays(3); // default
        
        switch (priority.toUpperCase()) {
            case "URGENT": return now.plusHours(4);
            case "HIGH": return now.plusHours(24);
            case "MEDIUM": return now.plusDays(3);
            case "LOW": return now.plusDays(7);
            default: return now.plusDays(3);
        }
    }
}
