package com.university.backend.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.university.backend.dto.ProfileUpdateRequest;
import com.university.backend.model.User;
import com.university.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal Object principal, @RequestBody ProfileUpdateRequest request) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Not authenticated"));
        }

        String email = null;
        if (principal instanceof OAuth2User) {
            email = ((OAuth2User) principal).getAttribute("email");
        } else if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        }

        if (email == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Could not extract email from principal"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Only update allowed fields (do not update role)
            if (request.getName() != null && !request.getName().isBlank()) {
                user.setName(request.getName());
            }
            if (request.getMobile() != null) {
                user.setMobile(request.getMobile());
            }
            if (request.getNic() != null) {
                user.setNic(request.getNic());
            }
            // Allow email update, but in a real app you might want to require email verification
            if (request.getEmail() != null && !request.getEmail().isBlank() && !request.getEmail().equals(user.getEmail())) {
                // Check if new email is already taken
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use!"));
                }
                user.setEmail(request.getEmail());
            }

            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        }

        return ResponseEntity.status(404).body(Map.of("message", "User not found"));
    }
}
