package com.university.backend.repository;

import com.university.backend.model.Ticket;
import com.university.backend.model.TicketStatus;
import com.university.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    List<Ticket> findByStatus(TicketStatus status);
    
    List<Ticket> findByCreatedBy(User user);
    
    List<Ticket> findByAssignedTechnician(User technician);
    
    List<Ticket> findByCategory(String category);
}
