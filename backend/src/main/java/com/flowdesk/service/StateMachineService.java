package com.flowdesk.service;

import com.flowdesk.model.*;
import com.flowdesk.repository.AuditLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
public class StateMachineService {

    private final AuditLogRepository auditLogRepository;

    // Transition Rule Record
    public record TransitionRule(Set<ServiceRequestStatus> allowedTo, Set<Role> allowedRoles) {}

    private final Map<ServiceRequestStatus, TransitionRule> stateMachineRules = new EnumMap<>(ServiceRequestStatus.class);

    public StateMachineService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
        initializeRules();
    }

    private void initializeRules() {
        // NEW -> ASSIGNED, CANCELLED (Dispatcher, Admin, Customer)
        stateMachineRules.put(ServiceRequestStatus.NEW, new TransitionRule(
                Set.of(ServiceRequestStatus.ASSIGNED, ServiceRequestStatus.CANCELLED),
                Set.of(Role.DISPATCHER, Role.ADMIN, Role.CUSTOMER)
        ));

        // ASSIGNED -> ACCEPTED, REJECTED_BY_TECHNICIAN (Technician)
        stateMachineRules.put(ServiceRequestStatus.ASSIGNED, new TransitionRule(
                Set.of(ServiceRequestStatus.ACCEPTED, ServiceRequestStatus.REJECTED_BY_TECHNICIAN),
                Set.of(Role.TECHNICIAN, Role.ADMIN)
        ));

        // REJECTED_BY_TECHNICIAN -> ASSIGNED, CANCELLED (Dispatcher, Admin)
        stateMachineRules.put(ServiceRequestStatus.REJECTED_BY_TECHNICIAN, new TransitionRule(
                Set.of(ServiceRequestStatus.ASSIGNED, ServiceRequestStatus.CANCELLED),
                Set.of(Role.DISPATCHER, Role.ADMIN)
        ));

        // ACCEPTED -> SCHEDULED (Dispatcher, Technician, Admin)
        stateMachineRules.put(ServiceRequestStatus.ACCEPTED, new TransitionRule(
                Set.of(ServiceRequestStatus.SCHEDULED),
                Set.of(Role.DISPATCHER, Role.TECHNICIAN, Role.ADMIN)
        ));

        // SCHEDULED -> EN_ROUTE, CANCELLED (Technician, Dispatcher, Admin)
        stateMachineRules.put(ServiceRequestStatus.SCHEDULED, new TransitionRule(
                Set.of(ServiceRequestStatus.EN_ROUTE, ServiceRequestStatus.CANCELLED),
                Set.of(Role.TECHNICIAN, Role.DISPATCHER, Role.ADMIN)
        ));

        // EN_ROUTE -> ON_SITE (Technician, Admin)
        stateMachineRules.put(ServiceRequestStatus.EN_ROUTE, new TransitionRule(
                Set.of(ServiceRequestStatus.ON_SITE),
                Set.of(Role.TECHNICIAN, Role.ADMIN)
        ));

        // ON_SITE -> IN_PROGRESS (Technician, Admin)
        stateMachineRules.put(ServiceRequestStatus.ON_SITE, new TransitionRule(
                Set.of(ServiceRequestStatus.IN_PROGRESS),
                Set.of(Role.TECHNICIAN, Role.ADMIN)
        ));

        // IN_PROGRESS -> COMPLETED (Technician, Admin)
        stateMachineRules.put(ServiceRequestStatus.IN_PROGRESS, new TransitionRule(
                Set.of(ServiceRequestStatus.COMPLETED),
                Set.of(Role.TECHNICIAN, Role.ADMIN)
        ));

        // COMPLETED -> CUSTOMER_CONFIRMED, DISPUTED (Customer, Admin)
        stateMachineRules.put(ServiceRequestStatus.COMPLETED, new TransitionRule(
                Set.of(ServiceRequestStatus.CUSTOMER_CONFIRMED, ServiceRequestStatus.DISPUTED),
                Set.of(Role.CUSTOMER, Role.ADMIN)
        ));

        // CUSTOMER_CONFIRMED -> CLOSED (System, Admin, Dispatcher)
        stateMachineRules.put(ServiceRequestStatus.CUSTOMER_CONFIRMED, new TransitionRule(
                Set.of(ServiceRequestStatus.CLOSED),
                Set.of(Role.ADMIN, Role.DISPATCHER, Role.CUSTOMER)
        ));

        // DISPUTED -> REOPENED, REFUNDED (Admin, Dispatcher)
        stateMachineRules.put(ServiceRequestStatus.DISPUTED, new TransitionRule(
                Set.of(ServiceRequestStatus.REOPENED, ServiceRequestStatus.REFUNDED),
                Set.of(Role.ADMIN, Role.DISPATCHER)
        ));

        // REOPENED -> ASSIGNED, SCHEDULED (Dispatcher, Admin)
        stateMachineRules.put(ServiceRequestStatus.REOPENED, new TransitionRule(
                Set.of(ServiceRequestStatus.ASSIGNED, ServiceRequestStatus.SCHEDULED),
                Set.of(Role.DISPATCHER, Role.ADMIN)
        ));
    }

    public void validateAndTransition(ServiceRequest request, ServiceRequestStatus targetStatus, User actor, String reason) {
        ServiceRequestStatus currentStatus = request.getStatus();

        if (currentStatus == targetStatus) {
            return;
        }

        TransitionRule rule = stateMachineRules.get(currentStatus);

        // 1. Check if fromState allows toState
        if (rule == null || !rule.allowedTo().contains(targetStatus)) {
            logAuditFailure(actor, request, currentStatus, targetStatus, "Invalid transition path");
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format("Invalid State Transition: Cannot transition from %s to %s (HTTP 409 Conflict)", currentStatus, targetStatus));
        }

        // 2. Check if actor has permission
        if (!rule.allowedRoles().contains(actor.getRole())) {
            logAuditFailure(actor, request, currentStatus, targetStatus, "Unauthorized role attempt");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    String.format("Role %s is not permitted to perform transition from %s to %s", actor.getRole(), currentStatus, targetStatus));
        }

        // 3. Precondition Checks
        if (targetStatus == ServiceRequestStatus.SCHEDULED && (request.getAssignedTechnician() == null || request.getAppointmentDate() == null)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Precondition Failed: Cannot move to SCHEDULED without an assigned technician and appointment slot.");
        }

        // Perform transition
        request.setStatus(targetStatus);

        // Record successful transition in AuditLog
        AuditLog log = AuditLog.builder()
                .actorId(actor.getId())
                .actorName(actor.getName())
                .actorRole(actor.getRole())
                .action("STATE_TRANSITION_" + targetStatus)
                .entityType("ServiceRequest")
                .entityId(request.getId())
                .fromState(currentStatus.name())
                .toState(targetStatus.name())
                .details(reason != null ? reason : "Transitioned successfully to " + targetStatus)
                .build();
        auditLogRepository.save(log);
    }

    private void logAuditFailure(User actor, ServiceRequest request, ServiceRequestStatus from, ServiceRequestStatus to, String details) {
        AuditLog log = AuditLog.builder()
                .actorId(actor != null ? actor.getId() : "SYSTEM")
                .actorName(actor != null ? actor.getName() : "Anonymous")
                .actorRole(actor != null ? actor.getRole() : Role.CUSTOMER)
                .action("TRANSITION_REJECTED")
                .entityType("ServiceRequest")
                .entityId(request.getId())
                .fromState(from != null ? from.name() : "UNKNOWN")
                .toState(to != null ? to.name() : "UNKNOWN")
                .details(details)
                .build();
        auditLogRepository.save(log);
    }
}
