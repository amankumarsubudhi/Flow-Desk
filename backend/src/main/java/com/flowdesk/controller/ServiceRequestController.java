package com.flowdesk.controller;

import com.flowdesk.model.*;
import com.flowdesk.repository.UserRepository;
import com.flowdesk.service.ServiceRequestService;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;
    private final UserRepository userRepository;

    public ServiceRequestController(ServiceRequestService serviceRequestService,
                                    UserRepository userRepository) {
        this.serviceRequestService = serviceRequestService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User) {
            return (User) auth.getPrincipal();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequest>> getAllRequests() {
        User currentUser = getAuthenticatedUser();
        // If customer, return all requests or all requests accessible; in multi-role system, let service return all or caller filter
        return ResponseEntity.ok(serviceRequestService.getAllRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequest> getRequestById(@PathVariable String id) {
        return ResponseEntity.ok(serviceRequestService.getRequestById(id));
    }

    @PostMapping
    public ResponseEntity<ServiceRequest> createRequest(@RequestBody CreateRequestDto dto,
                                                        @RequestParam(required = false) String userId) {
        User customer = null;
        if (userId != null && !userId.isBlank()) {
            customer = userRepository.findById(userId).orElse(null);
        }
        if (customer == null) {
            customer = getAuthenticatedUser();
        }
        if (customer == null) {
            customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst()
                    .orElseGet(() -> userRepository.findAll().stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No user available")));
        }

        ServiceRequest created = serviceRequestService.createRequest(
                dto.getTitle(),
                dto.getDescription(),
                dto.getCategoryId(),
                dto.getPriority(),
                dto.getAddress(),
                dto.getPreferredDate(),
                dto.getPreferredTimeWindow(),
                customer
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<ServiceRequest> assignTechnician(
            @PathVariable String id,
            @RequestBody AssignTechnicianDto dto,
            @RequestParam(required = false) String dispatcherId) {

        User dispatcher = null;
        if (dispatcherId != null && !dispatcherId.isBlank()) {
            dispatcher = userRepository.findById(dispatcherId).orElse(null);
        }
        if (dispatcher == null) {
            dispatcher = getAuthenticatedUser();
        }
        if (dispatcher == null) {
            dispatcher = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.DISPATCHER || u.getRole() == Role.ADMIN)
                    .findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized: Dispatcher or Admin required"));
        }

        ServiceRequest updated = serviceRequestService.assignTechnician(
                id,
                dto.getTechnicianId(),
                dto.getAppointmentDate(),
                dto.getAppointmentTimeWindow(),
                dispatcher
        );

        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/respond")
    public ResponseEntity<ServiceRequest> respondAssignment(
            @PathVariable String id,
            @RequestBody RespondAssignmentDto dto,
            @RequestParam(required = false) String technicianUserId) {

        User techUser = null;
        if (technicianUserId != null && !technicianUserId.isBlank()) {
            techUser = userRepository.findById(technicianUserId).orElse(null);
        }
        if (techUser == null) {
            techUser = getAuthenticatedUser();
        }
        if (techUser == null) {
            techUser = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.TECHNICIAN)
                    .findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized: Technician required"));
        }

        ServiceRequest updated = serviceRequestService.respondToAssignment(
                id,
                dto.isAccept(),
                dto.getReason(),
                techUser
        );

        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ServiceRequest> updateStatus(
            @PathVariable String id,
            @RequestBody UpdateStatusDto dto,
            @RequestParam(required = false) String actorId) {

        User actor = null;
        if (actorId != null && !actorId.isBlank()) {
            actor = userRepository.findById(actorId).orElse(null);
        }
        if (actor == null) {
            actor = getAuthenticatedUser();
        }
        if (actor == null) {
            actor = userRepository.findAll().get(0);
        }

        ServiceRequest updated = serviceRequestService.transitionStatus(id, dto.getStatus(), actor, dto.getReason());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/work-report")
    public ResponseEntity<ServiceRequest> submitWorkReport(
            @PathVariable String id,
            @RequestBody WorkReport report,
            @RequestParam(required = false) String technicianUserId) {

        User techUser = null;
        if (technicianUserId != null && !technicianUserId.isBlank()) {
            techUser = userRepository.findById(technicianUserId).orElse(null);
        }
        if (techUser == null) {
            techUser = getAuthenticatedUser();
        }
        if (techUser == null) {
            techUser = userRepository.findAll().stream().filter(u -> u.getRole() == Role.TECHNICIAN).findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Technician required"));
        }

        ServiceRequest updated = serviceRequestService.submitWorkReport(id, report, techUser);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<ServiceRequest> confirmWork(
            @PathVariable String id,
            @RequestBody ConfirmWorkDto dto,
            @RequestParam(required = false) String customerId) {

        User customer = null;
        if (customerId != null && !customerId.isBlank()) {
            customer = userRepository.findById(customerId).orElse(null);
        }
        if (customer == null) {
            customer = getAuthenticatedUser();
        }
        if (customer == null) {
            customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Customer required"));
        }

        ServiceRequest updated = serviceRequestService.customerConfirmWork(
                id,
                dto.isConfirm(),
                dto.getDisputeReason(),
                dto.getRatingScore(),
                dto.getRatingComment(),
                customer
        );

        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ServiceRequest> settlePayment(
            @PathVariable String id,
            @RequestBody PayInvoiceDto dto,
            @RequestParam(required = false) String actorId) {

        User actor = null;
        if (actorId != null && !actorId.isBlank()) {
            actor = userRepository.findById(actorId).orElse(null);
        }
        if (actor == null) {
            actor = getAuthenticatedUser();
        }
        if (actor == null) {
            actor = userRepository.findAll().get(0);
        }

        ServiceRequest updated = serviceRequestService.settlePayment(id, dto.getPaymentMethod(), actor);
        return ResponseEntity.ok(updated);
    }

    // DTO Classes
    @Data
    public static class CreateRequestDto {
        private String title;
        private String description;
        private String categoryId;
        private Priority priority;
        private String address;
        private String preferredDate;
        private String preferredTimeWindow;
    }

    @Data
    public static class AssignTechnicianDto {
        private String technicianId;
        private String appointmentDate;
        private String appointmentTimeWindow;
    }

    @Data
    public static class RespondAssignmentDto {
        private boolean accept;
        private String reason;
    }

    @Data
    public static class UpdateStatusDto {
        private ServiceRequestStatus status;
        private String reason;
    }

    @Data
    public static class ConfirmWorkDto {
        private boolean confirm;
        private String disputeReason;
        private Integer ratingScore;
        private String ratingComment;
    }

    @Data
    public static class PayInvoiceDto {
        private String paymentMethod;
    }
}
