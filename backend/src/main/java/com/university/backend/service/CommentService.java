package com.university.backend.service;

import com.university.backend.model.Comment;
import com.university.backend.model.Ticket;
import com.university.backend.model.User;
import com.university.backend.repository.CommentRepository;
import com.university.backend.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;

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
        
        return commentRepository.save(comment);
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
