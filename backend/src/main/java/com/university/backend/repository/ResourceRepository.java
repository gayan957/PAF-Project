package com.university.backend.repository;

import com.university.backend.model.Resource;
import com.university.backend.model.ResourceStatus;
import com.university.backend.model.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    @Query("SELECT r FROM Resource r WHERE " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:building IS NULL OR LOWER(r.building) LIKE LOWER(CONCAT('%', :building, '%'))) AND " +
           "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
           "(:keyword IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Resource> searchResources(
            @Param("type") ResourceType type,
            @Param("status") ResourceStatus status,
            @Param("location") String location,
            @Param("building") String building,
            @Param("minCapacity") Integer minCapacity,
            @Param("keyword") String keyword,
            Pageable pageable);

    long countByStatus(ResourceStatus status);

    @Query("SELECT r.type, COUNT(r) FROM Resource r GROUP BY r.type")
    List<Object[]> countGroupByType();

    @Query("SELECT r.building, COUNT(r) FROM Resource r WHERE r.building IS NOT NULL GROUP BY r.building")
    List<Object[]> countGroupByBuilding();
}