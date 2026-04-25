package com.university.backend.service.impl;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.university.backend.dto.ResourceAnalyticsDTO;
import com.university.backend.dto.ResourceRequestDTO;
import com.university.backend.dto.ResourceResponseDTO;
import com.university.backend.exception.InvalidStatusTransitionException;
import com.university.backend.exception.ResourceNotFoundException;
import com.university.backend.model.Resource;
import com.university.backend.model.ResourceStatus;
import com.university.backend.model.ResourceType;
import com.university.backend.repository.ResourceRepository;
import com.university.backend.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Override
    public Page<ResourceResponseDTO> getAllResources(ResourceType type, ResourceStatus status,
            String location, String building, Integer minCapacity, String keyword, Pageable pageable) {
        return resourceRepository
                .searchResources(type, status, location, building, minCapacity, keyword, pageable)
                .map(this::toDTO);
    }

    @Override
    public ResourceResponseDTO getResourceById(Long id) {
        return toDTO(findById(id));
    }

    @Override
    public ResourceResponseDTO createResource(ResourceRequestDTO req, String createdBy) {
        Resource resource = Resource.builder()
                .name(req.getName())
                .type(req.getType())
                .capacity(req.getCapacity())
                .location(req.getLocation())
                .building(req.getBuilding())
                .availabilityStart(req.getAvailabilityStart())
                .availabilityEnd(req.getAvailabilityEnd())
                .status(req.getStatus() != null ? req.getStatus() : ResourceStatus.ACTIVE)
                .description(req.getDescription())
                .imageUrl(req.getImageUrl())
                .createdBy(createdBy)
                .build();
        return toDTO(resourceRepository.save(resource));
    }

    @Override
    public ResourceResponseDTO updateResource(Long id, ResourceRequestDTO req) {
        Resource resource = findById(id);
        resource.setName(req.getName());
        resource.setType(req.getType());
        resource.setCapacity(req.getCapacity());
        resource.setLocation(req.getLocation());
        resource.setBuilding(req.getBuilding());
        resource.setAvailabilityStart(req.getAvailabilityStart());
        resource.setAvailabilityEnd(req.getAvailabilityEnd());
        resource.setDescription(req.getDescription());
        if (req.getImageUrl() != null) resource.setImageUrl(req.getImageUrl());
        return toDTO(resourceRepository.save(resource));
    }

    @Override
    public ResourceResponseDTO updateStatus(Long id, ResourceStatus newStatus,
            String reason, String changedBy) {
        Resource resource = findById(id);
        if (!resource.getStatus().canTransitionTo(newStatus)) {
            throw new InvalidStatusTransitionException(resource.getStatus(), newStatus);
        }
        resource.setStatus(newStatus);
        resource.setStatusReason(reason);
        resource.setStatusChangedBy(changedBy);
        resource.setUpdatedAt(LocalDateTime.now());
        return toDTO(resourceRepository.save(resource));
    }

    @Override
    public void deleteResource(Long id) {
        Resource resource = findById(id);
        resource.setStatus(ResourceStatus.OUT_OF_SERVICE);
        resource.setStatusReason("Removed from catalogue by admin");
        resourceRepository.save(resource);
    }

    @Override
    public ResourceAnalyticsDTO getAnalytics() {
        Map<String, Long> byType = new LinkedHashMap<>();
        for (Object[] row : resourceRepository.countGroupByType()) {
            byType.put(row[0].toString(), (Long) row[1]);
        }
        Map<String, Long> byBuilding = new LinkedHashMap<>();
        for (Object[] row : resourceRepository.countGroupByBuilding()) {
            byBuilding.put(row[0].toString(), (Long) row[1]);
        }
        return ResourceAnalyticsDTO.builder()
                .totalResources(resourceRepository.count())
                .activeCount(resourceRepository.countByStatus(ResourceStatus.ACTIVE))
                .outOfServiceCount(resourceRepository.countByStatus(ResourceStatus.OUT_OF_SERVICE))
                .underMaintenanceCount(resourceRepository.countByStatus(ResourceStatus.UNDER_MAINTENANCE))
                .countByType(byType)
                .countByBuilding(byBuilding)
                .build();
    }

    @Override
    public List<String> getAllTypes() {
        return Arrays.stream(ResourceType.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    @Override
    public byte[] generateQrCode(Long id) throws Exception {
        Resource resource = findById(id);
        String content = "SmartCampus | " + resource.getName()
                + " | " + resource.getLocation()
                + " | Status: " + resource.getStatus();
        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(content, BarcodeFormat.QR_CODE, 300, 300);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", out);
        return out.toByteArray();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Resource findById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with id: " + id));
    }

    private ResourceResponseDTO toDTO(Resource r) {
        return ResourceResponseDTO.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .building(r.getBuilding())
                .availabilityStart(r.getAvailabilityStart())
                .availabilityEnd(r.getAvailabilityEnd())
                .status(r.getStatus())
                .description(r.getDescription())
                .imageUrl(r.getImageUrl())
                .statusReason(r.getStatusReason())
                .createdBy(r.getCreatedBy())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}