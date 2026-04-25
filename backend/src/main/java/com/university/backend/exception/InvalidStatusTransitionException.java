package com.university.backend.exception;

import com.university.backend.model.ResourceStatus;

public class InvalidStatusTransitionException extends RuntimeException {
    public InvalidStatusTransitionException(ResourceStatus from, ResourceStatus to) {
        super("Cannot transition resource status from " + from + " to " + to);
    }
}