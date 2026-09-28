package com.flowdesk.repository;

import com.flowdesk.model.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, String> {
    List<ServiceCategory> findByActiveTrue();
}
