package com.university.backend.service;

import java.util.Collections;
import java.util.Optional;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.university.backend.model.Role;
import com.university.backend.model.User;
import com.university.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatarUrl = oAuth2User.getAttribute("picture"); // Google
        
        // GitHub specific attributes
        if (avatarUrl == null) {
            avatarUrl = oAuth2User.getAttribute("avatar_url");
        }
        if (name == null) {
            name = oAuth2User.getAttribute("login");
        }
        if (email == null) {
            String login = oAuth2User.getAttribute("login");
            email = login + "@github.com";
        }

        Optional<User> userOptional = userRepository.findByEmail(email);
        
        User user;
        if (userOptional.isEmpty()) {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .avatarUrl(avatarUrl)
                    .role(Role.ROLE_USER) // Default role
                    .build();
            user = userRepository.save(user);
        } else {
            user = userOptional.get();
        }

        java.util.Map<String, Object> attributes = new java.util.HashMap<>(oAuth2User.getAttributes());
        attributes.put("email", email);

        return new DefaultOAuth2User(
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name())),
                attributes,
                "email" // Using email as the primary key/name attribute for the principal
        );
    }
}
