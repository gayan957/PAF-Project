package com.university.backend.repository;

import com.university.backend.model.Ticket;
import com.university.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findAllByOrderByCreatedAtDesc();
    List<Ticket> findByCreatedByOrderByCreatedAtDesc(User creator);
    List<Ticket> findByAssignedTechnicianOrderByCreatedAtDesc(User technician);
}
