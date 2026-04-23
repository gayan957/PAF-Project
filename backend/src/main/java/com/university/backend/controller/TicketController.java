package com.university.backend.controller;

import com.university.backend.dto.TicketRequest;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody TicketRequest request, @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        User creator = userService.getUserByEmail(email);
        return ResponseEntity.ok(ticketService.createTicket(request, creator));
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
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
    public ResponseEntity<Ticket> assignTechnician(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        Long technicianId = request.get("technicianId");
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Ticket> resolveTicket(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String notes = request.get("notes");
        return ResponseEntity.ok(ticketService.resolveTicket(id, notes));
    }
}
