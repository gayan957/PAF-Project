package com.university.backend.controller;

import com.university.backend.dto.TicketRequest;
import com.university.backend.model.Attachment;
import com.university.backend.model.Ticket;
import com.university.backend.model.TicketStatus;
import com.university.backend.model.User;
import com.university.backend.service.TicketService;
import com.university.backend.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;

    private String extractEmail(Object principal) {
        if (principal instanceof OAuth2User) {
            return ((OAuth2User) principal).getAttribute("email");
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            return ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        }
        throw new RuntimeException("Unable to determine user email from principal");
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody TicketRequest request, @AuthenticationPrincipal Object principal) {
        String email = extractEmail(principal);
        User creator = userService.getUserByEmail(email);
        return ResponseEntity.ok(ticketService.createTicket(request, creator));
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets(@AuthenticationPrincipal Object principal) {
        String email = extractEmail(principal);
        User user = userService.getUserByEmail(email);
        
        if (user.getRole().name().equals("ROLE_ADMIN")) {
            return ResponseEntity.ok(ticketService.getAllTickets());
        } else if (user.getRole().name().equals("ROLE_TECHNICIAN")) {
            return ResponseEntity.ok(ticketService.getTicketsByTechnician(user));
        } else {
            return ResponseEntity.ok(ticketService.getTicketsByUser(user));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable Long id, @RequestBody TicketRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        TicketStatus status = TicketStatus.valueOf(request.get("status").toUpperCase());
        return ResponseEntity.ok(ticketService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTechnician(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Long technicianId = Long.parseLong(request.get("technicianId").toString());
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Ticket> resolveTicket(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String notes = request.get("notes");
        return ResponseEntity.ok(ticketService.resolveTicket(id, notes));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<List<Attachment>> addAttachments(@PathVariable Long id, @RequestParam("files") MultipartFile[] files) throws IOException {
        return ResponseEntity.ok(ticketService.addAttachments(id, files));
    }
}
