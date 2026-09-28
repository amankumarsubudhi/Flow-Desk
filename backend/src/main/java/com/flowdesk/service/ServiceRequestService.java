package com.flowdesk.service;

import com.flowdesk.model.*;
import com.flowdesk.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Random;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final TechnicianProfileRepository technicianRepository;
    private final StateMachineService stateMachineService;
    private final InvoicingService invoicingService;
    private final NotificationService notificationService;
    private final AuditLogRepository auditLogRepository;

    public ServiceRequestService(ServiceRequestRepository serviceRequestRepository,
                                 ServiceCategoryRepository categoryRepository,
                                 TechnicianProfileRepository technicianRepository,
                                 StateMachineService stateMachineService,
                                 InvoicingService invoicingService,
                                 NotificationService notificationService,
                                 AuditLogRepository auditLogRepository) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.categoryRepository = categoryRepository;
        this.technicianRepository = technicianRepository;
        this.stateMachineService = stateMachineService;
        this.invoicingService = invoicingService;
        this.notificationService = notificationService;
        this.auditLogRepository = auditLogRepository;
    }

    public List<ServiceRequest> getAllRequests() {
        return serviceRequestRepository.findAll();
    }

    public ServiceRequest getRequestById(String id) {
        return serviceRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service Request not found: " + id));
    }

    @Transactional
    public ServiceRequest createRequest(String title, String description, String categoryId, Priority priority,
                                         String address, String preferredDate, String preferredTimeWindow, User customer) {
        ServiceCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid service category: " + categoryId));

        if (!category.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Service category is currently inactive.");
        }

        String generatedId = "SR-" + (1000 + new Random().nextInt(9000));

        ServiceRequest request = ServiceRequest.builder()
                .id(generatedId)
                .title(title)
                .description(description)
                .category(category)
                .customer(customer)
                .priority(priority != null ? priority : Priority.MEDIUM)
                .address(address)
                .preferredDate(preferredDate)
                .preferredTimeWindow(preferredTimeWindow)
                .status(ServiceRequestStatus.NEW)
                .build();

        ServiceRequest saved = serviceRequestRepository.save(request);

        // Audit & Notification
        auditLogRepository.save(AuditLog.builder()
                .actorId(customer.getId())
                .actorName(customer.getName())
                .actorRole(customer.getRole())
                .action("SERVICE_REQUEST_CREATED")
                .entityType("ServiceRequest")
                .entityId(saved.getId())
                .toState("NEW")
                .details(String.format("Request created: %s (%s)", title, priority))
                .build());

        notificationService.sendNotification("DISPATCHER", null,
                "New Request: " + priority,
                String.format("#%s: %s submitted by %s", saved.getId(), title, customer.getName()),
                saved.getId(),
                priority == Priority.URGENT ? "ALERT" : "INFO");

        return saved;
    }

    @Transactional
    public ServiceRequest assignTechnician(String requestId, String technicianId, String appointmentDate,
                                            String appointmentTimeWindow, User dispatcher) {
        ServiceRequest request = getRequestById(requestId);
        TechnicianProfile technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Technician not found: " + technicianId));

        // Conflict Check (Section 5.2 - Server Side Overlap Validation)
        List<ServiceRequest> conflicts = serviceRequestRepository.findConflictingAppointments(
                technicianId, appointmentDate, appointmentTimeWindow, requestId);

        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format("Conflict Detected: Technician %s already has an active assignment on %s during %s",
                            technician.getUser().getName(), appointmentDate, appointmentTimeWindow));
        }

        request.setAssignedTechnician(technician);
        request.setAppointmentDate(appointmentDate);
        request.setAppointmentTimeWindow(appointmentTimeWindow);

        stateMachineService.validateAndTransition(request, ServiceRequestStatus.ASSIGNED, dispatcher,
                "Assigned to " + technician.getUser().getName());

        ServiceRequest updated = serviceRequestRepository.save(request);

        notificationService.sendNotification("TECHNICIAN", technician.getUser().getId(),
                "New Job Assignment",
                String.format("You are assigned to #%s on %s (%s)", request.getId(), appointmentDate, appointmentTimeWindow),
                request.getId(),
                "INFO");

        return updated;
    }

    @Transactional
    public ServiceRequest respondToAssignment(String requestId, boolean accept, String reason, User technicianUser) {
        ServiceRequest request = getRequestById(requestId);

        if (accept) {
            stateMachineService.validateAndTransition(request, ServiceRequestStatus.ACCEPTED, technicianUser, "Accepted by technician");
            notificationService.sendNotification("DISPATCHER", null, "Assignment Accepted",
                    String.format("Technician %s accepted #%s", technicianUser.getName(), requestId), requestId, "SUCCESS");
        } else {
            stateMachineService.validateAndTransition(request, ServiceRequestStatus.REJECTED_BY_TECHNICIAN, technicianUser,
                    "Declined by technician: " + (reason != null ? reason : "Unavailable"));
            request.setAssignedTechnician(null);
            notificationService.sendNotification("DISPATCHER", null, "Assignment Declined",
                    String.format("Technician %s declined #%s: %s", technicianUser.getName(), requestId, reason), requestId, "WARNING");
        }

        return serviceRequestRepository.save(request);
    }

    @Transactional
    public ServiceRequest transitionStatus(String requestId, ServiceRequestStatus targetStatus, User actor, String reason) {
        ServiceRequest request = getRequestById(requestId);
        stateMachineService.validateAndTransition(request, targetStatus, actor, reason);
        return serviceRequestRepository.save(request);
    }

    @Transactional
    public ServiceRequest submitWorkReport(String requestId, WorkReport report, User technicianUser) {
        ServiceRequest request = getRequestById(requestId);

        stateMachineService.validateAndTransition(request, ServiceRequestStatus.COMPLETED, technicianUser, "Work completed and report submitted");

        request.setWorkReport(report);
        Invoice invoice = invoicingService.generateInvoice(request, report);
        request.setInvoice(invoice);

        ServiceRequest saved = serviceRequestRepository.save(request);

        notificationService.sendNotification("CUSTOMER", request.getCustomer().getId(),
                "Work Completed — Review Required",
                String.format("Technician finished work on #%s. Total: ₹%.2f. Please review and confirm.", requestId, invoice.getTotalAmount()),
                requestId,
                "SUCCESS");

        return saved;
    }

    @Transactional
    public ServiceRequest customerConfirmWork(String requestId, boolean confirm, String disputeReason,
                                              Integer ratingScore, String ratingComment, User customer) {
        ServiceRequest request = getRequestById(requestId);

        if (confirm) {
            stateMachineService.validateAndTransition(request, ServiceRequestStatus.CUSTOMER_CONFIRMED, customer, "Customer confirmed satisfactory completion");
            if (ratingScore != null) {
                request.setRatingScore(ratingScore);
                request.setRatingComment(ratingComment);
            }
            notificationService.sendNotification("DISPATCHER", null, "Job Confirmed by Customer",
                    String.format("Customer confirmed completion of #%s", requestId), requestId, "SUCCESS");
        } else {
            request.setDisputeReason(disputeReason);
            stateMachineService.validateAndTransition(request, ServiceRequestStatus.DISPUTED, customer,
                    "Customer raised dispute: " + disputeReason);
            notificationService.sendNotification("DISPATCHER", null, "Dispute Raised",
                    String.format("Customer reported issue on #%s: %s", requestId, disputeReason), requestId, "ALERT");
        }

        return serviceRequestRepository.save(request);
    }

    @Transactional
    public ServiceRequest settlePayment(String requestId, String paymentMethod, User actor) {
        ServiceRequest request = getRequestById(requestId);
        if (request.getInvoice() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No invoice exists for request: " + requestId);
        }

        invoicingService.processPayment(request.getInvoice(), paymentMethod);
        stateMachineService.validateAndTransition(request, ServiceRequestStatus.CLOSED, actor, "Payment settled via " + paymentMethod);

        return serviceRequestRepository.save(request);
    }
}
