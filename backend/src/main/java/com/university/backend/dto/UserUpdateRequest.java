package com.university.backend.dto;

import com.university.backend.model.Role;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private Role role;
}
