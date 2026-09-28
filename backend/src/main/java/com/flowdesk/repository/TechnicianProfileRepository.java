package com.flowdesk.repository;

import com.flowdesk.model.TechnicianProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechnicianProfileRepository extends JpaRepository<TechnicianProfile, String> {
    Optional<TechnicianProfile> findByUserId(String userId);
    List<TechnicianProfile> findByAvailable(boolean available);
}
