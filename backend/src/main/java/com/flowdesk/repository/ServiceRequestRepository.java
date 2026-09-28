package com.flowdesk.repository;

import com.flowdesk.model.Priority;
import com.flowdesk.model.ServiceRequest;
import com.flowdesk.model.ServiceRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, String> {
    List<ServiceRequest> findByCustomerId(String customerId);
    List<ServiceRequest> findByAssignedTechnicianId(String technicianId);
    List<ServiceRequest> findByStatus(ServiceRequestStatus status);
    List<ServiceRequest> findByPriority(Priority priority);

    @Query("SELECT r FROM ServiceRequest r WHERE r.assignedTechnician.id = :techId " +
           "AND r.appointmentDate = :date AND r.appointmentTimeWindow = :timeWindow " +
           "AND r.status IN ('ASSIGNED', 'ACCEPTED', 'SCHEDULED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS') " +
           "AND (:excludeId IS NULL OR r.id != :excludeId)")
    List<ServiceRequest> findConflictingAppointments(
            @Param("techId") String techId,
            @Param("date") String date,
            @Param("timeWindow") String timeWindow,
            @Param("excludeId") String excludeId);
}
