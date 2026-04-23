package com.university.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'TECHNICIAN')")
    public String getUserDashboardData() {
        return "Welcome to the User Dashboard: Here are your bookings and tickets.";
    }

    @GetMapping("/technician")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public String getTechnicianDashboardData() {
        return "Welcome to the Technician Dashboard: Here are your assigned incident tickets.";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String getAdminDashboardData() {
        return "Welcome to the Admin Dashboard: System overview, pending bookings, and user management.";
    }
}
