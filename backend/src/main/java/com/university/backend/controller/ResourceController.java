package com.university.backend.controller;

import com.university.backend.dto.ApiResponse;
import com.university.backend.dto.ResourceAnalyticsDTO;
import com.university.backend.dto.ResourceRequestDTO;
import com.university.backend.dto.ResourceResponseDTO;
import com.university.backend.model.ResourceStatus;
import com.university.backend.model.ResourceType;
import com.university.backend.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    /** GET /api/v1/resources - browse with filters */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ResourceResponseDTO>>> getAll(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {

        return ResponseEntity.ok(ApiResponse.success(
                resourceService.getAllResources(
                        type, status, location, building, minCapacity, keyword, pageable)));
    }

    /** GET /api/v1/resources/types - enum dropdown values */
    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<String>>> getTypes() {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getAllTypes()));
    }

    /** GET /api/v1/resources/analytics - admin dashboard stats */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceAnalyticsDTO>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getAnalytics()));
    }

    /** GET /api/v1/resources/{id} - single resource detail */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getResourceById(id)));
    }

    /** POST /api/v1/resources - create new resource (ADMIN only) */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> create(
            @Valid @RequestBody ResourceRequestDTO request,
            Principal principal) {

        String createdBy = principal != null ? principal.getName() : "admin";
        ResourceResponseDTO created = resourceService.createResource(request, createdBy);
        return ResponseEntity
                .created(URI.create("/api/v1/resources/" + created.getId()))
                .body(ApiResponse.success("Resource created successfully", created));
    }

    /** PUT /api/v1/resources/{id} - full update (ADMIN only) */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequestDTO request) {

        return ResponseEntity.ok(ApiResponse.success(
                "Resource updated successfully",
                resourceService.updateResource(id, request)));
    }

    /** PATCH /api/v1/resources/{id}/status - status change only (ADMIN only) */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam ResourceStatus status,
            @RequestParam(required = false) String reason,
            Principal principal) {

        String changedBy = principal != null ? principal.getName() : "admin";
        return ResponseEntity.ok(ApiResponse.success(
                "Status updated successfully",
                resourceService.updateStatus(id, status, reason, changedBy)));
    }

    /** DELETE /api/v1/resources/{id} - delete resource (ADMIN only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
