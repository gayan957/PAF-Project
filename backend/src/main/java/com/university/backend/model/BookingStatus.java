package com.university.backend.model;

public enum BookingStatus {
    PENDING,    // just created, waiting for admin
    APPROVED,   // admin said yes
    REJECTED,   // admin said no
    CANCELLED   // user cancelled an approved booking
}
