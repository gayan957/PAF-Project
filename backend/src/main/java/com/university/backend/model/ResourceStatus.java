package com.university.backend.model;

import java.util.Map;
import java.util.Set;

public enum ResourceStatus {
    ACTIVE,
    UNDER_MAINTENANCE,
    OUT_OF_SERVICE;

    private static final Map<ResourceStatus, Set<ResourceStatus>> ALLOWED = Map.of(
        ACTIVE,            Set.of(UNDER_MAINTENANCE, OUT_OF_SERVICE),
        UNDER_MAINTENANCE, Set.of(ACTIVE, OUT_OF_SERVICE),
        OUT_OF_SERVICE,    Set.of(UNDER_MAINTENANCE)
    );

    public boolean canTransitionTo(ResourceStatus next) {
        return ALLOWED.getOrDefault(this, Set.of()).contains(next);
    }
}