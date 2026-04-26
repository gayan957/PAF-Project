package com.university.backend.service;

import com.university.backend.model.Comment;
import com.university.backend.model.NotificationType;
import com.university.backend.model.Ticket;
import com.university.backend.model.User;
import com.university.backend.repository.CommentRepository;
import com.university.backend.repository.TicketRepository;
import com.university.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;

    public List<Comment> getCommentsByTicket(Long ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return commentRepository.findByTicketOrderByCreatedAtDesc(ticket);
    }

    @Transactional
    public Comment addComment(Long ticketId, String content, User user) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        Comment comment = Comment.builder()
                .content(content)
                .user(user)
                .ticket(ticket)
                .build();
                
        // Update firstResponseAt if this is the first response from someone other than the creator
        if (ticket.getFirstResponseAt() == null && !user.getId().equals(ticket.getCreatedBy().getId())) {
            ticket.setFirstResponseAt(java.time.LocalDateTime.now());
            // Optionally, change status to IN_PROGRESS if it's currently OPEN
            if (ticket.getStatus() == com.university.backend.model.TicketStatus.OPEN) {
                ticket.setStatus(com.university.backend.model.TicketStatus.IN_PROGRESS);
            }
            ticketRepository.save(ticket);
        }
        
        Comment saved = commentRepository.save(comment);

        // Notify the other party: if commenter is the ticket creator, notify the assigned technician; otherwise notify the creator
        boolean commenterIsCreator = user.getId().equals(ticket.getCreatedBy().getId());
        if (commenterIsCreator && ticket.getAssignedTechnician() != null) {
            notificationService.sendNotification(
                ticket.getAssignedTechnician(),
                NotificationType.TICKET_COMMENT_ADDED,
                "New Comment on Ticket",
                user.getName() + " commented on ticket \"" + ticket.getCategory() + "\".",
                ticket.getId(), "TICKET"
            );
        } else if (!commenterIsCreator) {
            notificationService.sendNotification(
                ticket.getCreatedBy(),
                NotificationType.TICKET_COMMENT_ADDED,
                "New Comment on Your Ticket",
                user.getName() + " commented on your ticket \"" + ticket.getCategory() + "\".",
                ticket.getId(), "TICKET"
            );
        }

        notificationService.sendNotificationToAllAdmins(
            NotificationType.ADMIN_COMMENT_ADDED,
            "New Comment on Ticket",
            user.getName() + " commented on ticket \"" + ticket.getCategory() + "\".",
            ticket.getId(), "TICKET"
        );

        return saved;
    }

    @Transactional
    public Comment updateComment(Long commentId, String newContent, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Authorization check
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to edit this comment");
        }
        
        comment.setContent(newContent);
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        // Authorization check: User who made the comment or Admin (assuming ADMIN can delete)
        if (!comment.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ROLE_ADMIN")) {
            throw new RuntimeException("Unauthorized to delete this comment");
        }
        
        commentRepository.delete(comment);
    }
}
