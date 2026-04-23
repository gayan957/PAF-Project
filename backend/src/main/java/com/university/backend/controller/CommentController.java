package com.university.backend.controller;

import com.university.backend.dto.CommentRequest;
import com.university.backend.model.Comment;
import com.university.backend.model.User;
import com.university.backend.service.CommentService;
import com.university.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

    private User getCurrentUser(OAuth2User principal) {
        String email = principal.getAttribute("email");
        return userService.getUserByEmail(email);
    }

    @GetMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicket(ticketId));
    }

    @PostMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<Comment> addComment(
            @PathVariable Long ticketId, 
            @RequestBody CommentRequest request,
            @AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.ok(commentService.addComment(ticketId, request.getContent(), getCurrentUser(principal)));
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable Long id, 
            @RequestBody CommentRequest request,
            @AuthenticationPrincipal OAuth2User principal) {
        return ResponseEntity.ok(commentService.updateComment(id, request.getContent(), getCurrentUser(principal)));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User principal) {
        commentService.deleteComment(id, getCurrentUser(principal));
        return ResponseEntity.noContent().build();
    }
}
