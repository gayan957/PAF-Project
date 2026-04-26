package com.university.backend.service;

import com.university.backend.dto.ResourceAnalyticsDTO;
import com.university.backend.dto.ResourceRequestDTO;
import com.university.backend.dto.ResourceResponseDTO;
import com.university.backend.model.ResourceStatus;
import com.university.backend.model.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ResourceService {
    Page<ResourceResponseDTO> getAllResources(ResourceType type, ResourceStatus status,
            String location, String building, Integer minCapacity, String keyword, Pageable pageable);
    ResourceResponseDTO getResourceById(Long id);
    ResourceResponseDTO createResource(ResourceRequestDTO request, String createdBy);
    ResourceResponseDTO createResourceWithImages(ResourceRequestDTO request, String createdBy,
            MultipartFile[] images) throws IOException;
    ResourceResponseDTO updateResource(Long id, ResourceRequestDTO request);
    ResourceResponseDTO updateResourceWithImages(Long id, ResourceRequestDTO request,
            MultipartFile[] images) throws IOException;
    ResourceResponseDTO updateStatus(Long id, ResourceStatus status, String reason, String changedBy);
    void deleteResource(Long id);
    ResourceAnalyticsDTO getAnalytics();
    List<String> getAllTypes();
}
