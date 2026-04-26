package com.university.backend.service.impl;

import com.university.backend.dto.ResourceAnalyticsDTO;
import com.university.backend.dto.ResourceAvailabilityWindowDTO;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private static final String IMAGE_SEPARATOR = "\n";
    private static final String WINDOW_SEPARATOR = "\n";
    private static final String WINDOW_PART_SEPARATOR = "|";
    private static final int MAX_RESOURCE_IMAGES = 5;

    private final ResourceRepository resourceRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

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
        List<String> imageUrls = normalizeImageUrls(req.getImageUrls(), req.getImageUrl());
        List<ResourceAvailabilityWindowDTO> windows = normalizeAvailabilityWindows(req);
        Resource resource = Resource.builder()
                .name(req.getName())
                .type(req.getType())
                .capacity(req.getCapacity())
                .location(req.getLocation())
                .building(req.getBuilding())
                .availabilityStart(primaryOpeningTime(windows))
                .availabilityEnd(primaryClosingTime(windows))
                .availabilityWindows(serializeAvailabilityWindows(windows))
                .status(req.getStatus() != null ? req.getStatus() : ResourceStatus.ACTIVE)
                .description(req.getDescription())
                .imageUrl(primaryImageUrl(imageUrls))
                .imageGallery(serializeImageUrls(imageUrls))
                .createdBy(createdBy)
                .build();
        return toDTO(resourceRepository.save(resource));
    }

    @Override
    public ResourceResponseDTO createResourceWithImages(ResourceRequestDTO req, String createdBy,
            MultipartFile[] images) throws IOException {
        List<String> imageUrls = normalizeImageUrls(req.getImageUrls(), req.getImageUrl());
        imageUrls.addAll(storeImages(images, MAX_RESOURCE_IMAGES - imageUrls.size()));
        validateImageCount(imageUrls);
        List<ResourceAvailabilityWindowDTO> windows = normalizeAvailabilityWindows(req);

        Resource resource = Resource.builder()
                .name(req.getName())
                .type(req.getType())
                .capacity(req.getCapacity())
                .location(req.getLocation())
                .building(req.getBuilding())
                .availabilityStart(primaryOpeningTime(windows))
                .availabilityEnd(primaryClosingTime(windows))
                .availabilityWindows(serializeAvailabilityWindows(windows))
                .status(req.getStatus() != null ? req.getStatus() : ResourceStatus.ACTIVE)
                .description(req.getDescription())
                .imageUrl(primaryImageUrl(imageUrls))
                .imageGallery(serializeImageUrls(imageUrls))
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
        List<ResourceAvailabilityWindowDTO> windows = normalizeAvailabilityWindows(req);
        resource.setAvailabilityStart(primaryOpeningTime(windows));
        resource.setAvailabilityEnd(primaryClosingTime(windows));
        resource.setAvailabilityWindows(serializeAvailabilityWindows(windows));
        resource.setStatus(req.getStatus());
        resource.setDescription(req.getDescription());
        List<String> imageUrls = normalizeImageUrls(req.getImageUrls(), req.getImageUrl());
        resource.setImageUrl(primaryImageUrl(imageUrls));
        resource.setImageGallery(serializeImageUrls(imageUrls));
        return toDTO(resourceRepository.save(resource));
    }

    @Override
    public ResourceResponseDTO updateResourceWithImages(Long id, ResourceRequestDTO req,
            MultipartFile[] images) throws IOException {
        Resource resource = findById(id);
        resource.setName(req.getName());
        resource.setType(req.getType());
        resource.setCapacity(req.getCapacity());
        resource.setLocation(req.getLocation());
        resource.setBuilding(req.getBuilding());
        List<ResourceAvailabilityWindowDTO> windows = normalizeAvailabilityWindows(req);
        resource.setAvailabilityStart(primaryOpeningTime(windows));
        resource.setAvailabilityEnd(primaryClosingTime(windows));
        resource.setAvailabilityWindows(serializeAvailabilityWindows(windows));
        resource.setStatus(req.getStatus());
        resource.setDescription(req.getDescription());

        List<String> imageUrls = normalizeImageUrls(req.getImageUrls(), req.getImageUrl());
        imageUrls.addAll(storeImages(images, MAX_RESOURCE_IMAGES - imageUrls.size()));
        validateImageCount(imageUrls);
        resource.setImageUrl(primaryImageUrl(imageUrls));
        resource.setImageGallery(serializeImageUrls(imageUrls));
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
        resourceRepository.delete(resource);
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

    // Helpers

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
                .availabilityWindows(allAvailabilityWindows(r))
                .status(r.getStatus())
                .description(r.getDescription())
                .imageUrl(primaryImageUrl(r))
                .imageUrls(allImageUrls(r))
                .statusReason(r.getStatusReason())
                .createdBy(r.getCreatedBy())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private List<String> storeImages(MultipartFile[] images, int remainingSlots) throws IOException {
        List<String> storedUrls = new ArrayList<>();
        if (images == null || images.length == 0) {
            return storedUrls;
        }

        long validImageCount = Arrays.stream(images)
                .filter(Objects::nonNull)
                .filter(image -> !image.isEmpty())
                .count();
        if (validImageCount > remainingSlots) {
            throw new IllegalArgumentException(
                    "Maximum " + MAX_RESOURCE_IMAGES + " photos can be added per resource");
        }

        Path uploadPath = Paths.get(uploadDir, "resources");
        try {
            Files.createDirectories(uploadPath);
        } catch (AccessDeniedException ex) {
            throw new IOException("Cannot create resource image upload folder: " + uploadPath, ex);
        }

        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) {
                continue;
            }
            String contentType = image.getContentType();
            if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
                throw new IllegalArgumentException("Only image files are allowed for resource photos");
            }

            String originalName = Optional.ofNullable(image.getOriginalFilename()).orElse("resource-image");
            String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
            String fileName = UUID.randomUUID() + "_" + safeName;
            Path filePath = uploadPath.resolve(fileName);
            try {
                Files.copy(image.getInputStream(), filePath);
            } catch (AccessDeniedException ex) {
                throw new IOException("Cannot save resource image to upload folder: " + uploadPath, ex);
            }
            storedUrls.add("/uploads/resources/" + fileName);
        }

        return storedUrls;
    }

    private List<String> normalizeImageUrls(List<String> imageUrls, String imageUrl) {
        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        if (imageUrls != null) {
            imageUrls.stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(url -> !url.isBlank())
                    .forEach(normalized::add);
        }
        if (imageUrl != null && !imageUrl.trim().isBlank()) {
            normalized.add(imageUrl.trim());
        }
        List<String> normalizedUrls = new ArrayList<>(normalized);
        validateImageCount(normalizedUrls);
        return normalizedUrls;
    }

    private List<String> allImageUrls(Resource resource) {
        List<String> imageUrls = parseImageUrls(resource.getImageGallery());
        imageUrls.addAll(parseImageUrls(resource.getImageUrl()));
        return normalizeImageUrls(imageUrls, null);
    }

    private String primaryImageUrl(Resource resource) {
        List<String> imageUrls = allImageUrls(resource);
        return primaryImageUrl(imageUrls);
    }

    private String primaryImageUrl(List<String> imageUrls) {
        return imageUrls == null || imageUrls.isEmpty() ? null : imageUrls.get(0);
    }

    private String serializeImageUrls(List<String> imageUrls) {
        return imageUrls == null || imageUrls.isEmpty()
                ? null
                : String.join(IMAGE_SEPARATOR, imageUrls);
    }

    private void validateImageCount(List<String> imageUrls) {
        if (imageUrls != null && imageUrls.size() > MAX_RESOURCE_IMAGES) {
            throw new IllegalArgumentException(
                    "Maximum " + MAX_RESOURCE_IMAGES + " photos can be added per resource");
        }
    }

    private List<String> parseImageUrls(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(imageUrl.split("\\R"))
                .map(String::trim)
                .filter(url -> !url.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }

    private List<ResourceAvailabilityWindowDTO> normalizeAvailabilityWindows(ResourceRequestDTO req) {
        List<ResourceAvailabilityWindowDTO> source = req.getAvailabilityWindows();
        if (source == null || source.isEmpty()) {
            source = List.of(ResourceAvailabilityWindowDTO.builder()
                    .day("MONDAY")
                    .openingTime(req.getAvailabilityStart())
                    .closingTime(req.getAvailabilityEnd())
                    .build());
        }

        List<ResourceAvailabilityWindowDTO> windows = source.stream()
                .filter(Objects::nonNull)
                .map(window -> ResourceAvailabilityWindowDTO.builder()
                        .day(normalizeDay(window.getDay()))
                        .openingTime(trimToNull(window.getOpeningTime()))
                        .closingTime(trimToNull(window.getClosingTime()))
                        .build())
                .filter(window -> window.getDay() != null
                        && window.getOpeningTime() != null
                        && window.getClosingTime() != null)
                .collect(Collectors.toList());

        if (windows.isEmpty()) {
            throw new IllegalArgumentException("At least one availability window is required");
        }
        for (ResourceAvailabilityWindowDTO window : windows) {
            if (window.getOpeningTime().compareTo(window.getClosingTime()) >= 0) {
                throw new IllegalArgumentException("Closing time must be later than opening time");
            }
        }
        return windows;
    }

    private String serializeAvailabilityWindows(List<ResourceAvailabilityWindowDTO> windows) {
        return windows.stream()
                .map(window -> String.join(WINDOW_PART_SEPARATOR,
                        window.getDay(),
                        window.getOpeningTime(),
                        window.getClosingTime()))
                .collect(Collectors.joining(WINDOW_SEPARATOR));
    }

    private List<ResourceAvailabilityWindowDTO> allAvailabilityWindows(Resource resource) {
        List<ResourceAvailabilityWindowDTO> windows = parseAvailabilityWindows(resource.getAvailabilityWindows());
        if (!windows.isEmpty()) {
            return windows;
        }
        if (resource.getAvailabilityStart() != null && resource.getAvailabilityEnd() != null) {
            return List.of(ResourceAvailabilityWindowDTO.builder()
                    .day("MONDAY")
                    .openingTime(resource.getAvailabilityStart())
                    .closingTime(resource.getAvailabilityEnd())
                    .build());
        }
        return new ArrayList<>();
    }

    private List<ResourceAvailabilityWindowDTO> parseAvailabilityWindows(String serializedWindows) {
        if (serializedWindows == null || serializedWindows.trim().isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(serializedWindows.split("\\R"))
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .map(line -> line.split("\\|"))
                .filter(parts -> parts.length == 3)
                .map(parts -> ResourceAvailabilityWindowDTO.builder()
                        .day(normalizeDay(parts[0]))
                        .openingTime(parts[1].trim())
                        .closingTime(parts[2].trim())
                        .build())
                .collect(Collectors.toList());
    }

    private String primaryOpeningTime(List<ResourceAvailabilityWindowDTO> windows) {
        return windows.get(0).getOpeningTime();
    }

    private String primaryClosingTime(List<ResourceAvailabilityWindowDTO> windows) {
        return windows.get(0).getClosingTime();
    }

    private String normalizeDay(String day) {
        if (day == null) return null;
        return day.trim().toUpperCase();
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isBlank()) return null;
        return value.trim();
    }
}
