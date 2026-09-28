package com.flowdesk.config;

import com.flowdesk.model.*;
import com.flowdesk.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final TechnicianProfileRepository technicianRepository;
    private final ServiceRequestRepository requestRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ServiceCategoryRepository categoryRepository,
                           TechnicianProfileRepository technicianRepository,
                           ServiceRequestRepository requestRepository,
                           AuditLogRepository auditLogRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.technicianRepository = technicianRepository;
        this.requestRepository = requestRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // 1. Seed Users
        User admin = userRepository.save(User.builder()
                .name("Sarah Jenkins")
                .email("sarah.jenkins@flowdesk.io")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.ADMIN)
                .avatar("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")
                .phone("+1 (555) 111-2222")
                .build());

        User dispatcher = userRepository.save(User.builder()
                .name("Alex Rivera")
                .email("alex.rivera@flowdesk.io")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.DISPATCHER)
                .avatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                .phone("+1 (555) 222-3333")
                .build());

        User techUser1 = userRepository.save(User.builder()
                .name("David Miller")
                .email("david.miller@flowdesk.io")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.TECHNICIAN)
                .avatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150")
                .phone("+1 (555) 234-5678")
                .build());

        User techUser2 = userRepository.save(User.builder()
                .name("Marcus Vance")
                .email("marcus.vance@flowdesk.io")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.TECHNICIAN)
                .avatar("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150")
                .phone("+1 (555) 345-6789")
                .build());

        User techUser3 = userRepository.save(User.builder()
                .name("Elena Rostova")
                .email("elena.rostova@flowdesk.io")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.TECHNICIAN)
                .avatar("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150")
                .phone("+1 (555) 456-7890")
                .build());

        User customer = userRepository.save(User.builder()
                .name("Emily Watson")
                .email("emily.watson@horizonestates.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.CUSTOMER)
                .avatar("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150")
                .phone("+1 (555) 890-1234")
                .build());

        // 2. Seed Categories
        ServiceCategory catHvac = categoryRepository.save(ServiceCategory.builder()
                .id("cat_hvac")
                .name("HVAC & Climate Control")
                .description("Heating, ventilation, air conditioning diagnostics, repairs, and annual maintenance.")
                .icon("Wind")
                .baseCharge(650.0)
                .active(true)
                .build());

        ServiceCategory catElec = categoryRepository.save(ServiceCategory.builder()
                .id("cat_electrical")
                .name("Electrical Systems")
                .description("Wiring inspections, circuit breaker fixes, electrical panel upgrades, smart sensors.")
                .icon("Zap")
                .baseCharge(550.0)
                .active(true)
                .build());

        ServiceCategory catPlumb = categoryRepository.save(ServiceCategory.builder()
                .id("cat_plumbing")
                .name("Commercial & Domestic Plumbing")
                .description("Pipe leaks, drainage, water heaters, high-pressure line checks.")
                .icon("Droplets")
                .baseCharge(500.0)
                .active(true)
                .build());

        ServiceCategory catAppliance = categoryRepository.save(ServiceCategory.builder()
                .id("cat_appliance")
                .name("Appliance Repair")
                .description("Industrial and domestic refrigeration, washer units, ovens, compressors.")
                .icon("Wrench")
                .baseCharge(450.0)
                .active(true)
                .build());

        ServiceCategory catSecurity = categoryRepository.save(ServiceCategory.builder()
                .id("cat_security")
                .name("Access Control & Surveillance")
                .description("CCTV systems, biometric door controllers, motion alarm setups.")
                .icon("ShieldCheck")
                .baseCharge(700.0)
                .active(true)
                .build());

        // 3. Seed Technician Profiles
        TechnicianProfile tech1 = technicianRepository.save(TechnicianProfile.builder()
                .user(techUser1)
                .skillCategoryIds(Set.of("cat_hvac", "cat_appliance"))
                .available(true)
                .rating(4.9)
                .completedJobsCount(142)
                .currentLocation("Sector 4, West Business District")
                .build());

        TechnicianProfile tech2 = technicianRepository.save(TechnicianProfile.builder()
                .user(techUser2)
                .skillCategoryIds(Set.of("cat_electrical", "cat_security"))
                .available(true)
                .rating(4.8)
                .completedJobsCount(98)
                .currentLocation("Downtown Commercial Center")
                .build());

        TechnicianProfile tech3 = technicianRepository.save(TechnicianProfile.builder()
                .user(techUser3)
                .skillCategoryIds(Set.of("cat_plumbing", "cat_hvac"))
                .available(true)
                .rating(4.95)
                .completedJobsCount(215)
                .currentLocation("North Tech Corridor")
                .build());

        // 4. Seed Requests
        requestRepository.save(ServiceRequest.builder()
                .id("SR-8092")
                .title("HVAC Air Handler Coil Leaking & Not Cooling")
                .description("The main compressor unit on Floor 3 is vibrating heavily, and the condenser coils show ice buildup. Office ambient temperature reached 28°C.")
                .category(catHvac)
                .customer(customer)
                .priority(Priority.HIGH)
                .address("742 Evergreen Plaza, Suite 300, Central Tech Hub")
                .preferredDate("2026-09-29")
                .preferredTimeWindow("10:00 AM - 12:00 PM")
                .status(ServiceRequestStatus.IN_PROGRESS)
                .assignedTechnician(tech1)
                .appointmentDate("2026-09-29")
                .appointmentTimeWindow("10:00 AM - 12:00 PM")
                .build());

        requestRepository.save(ServiceRequest.builder()
                .id("SR-8093")
                .title("Main Circuit Breaker Tripping on Load Spike")
                .description("Server room secondary distribution panel tripped twice during peak operating hours. Need thermal scanning and breaker continuity check.")
                .category(catElec)
                .customer(customer)
                .priority(Priority.URGENT)
                .address("120 Innovation Parkway, Bldg B")
                .preferredDate("2026-09-27")
                .preferredTimeWindow("08:00 AM - 10:00 AM")
                .status(ServiceRequestStatus.NEW)
                .build());

        // 5. Seed Audit Logs
        auditLogRepository.save(AuditLog.builder()
                .actorId(dispatcher.getId())
                .actorName(dispatcher.getName())
                .actorRole(dispatcher.getRole())
                .action("ASSIGNED_TECHNICIAN")
                .entityType("ServiceRequest")
                .entityId("SR-8092")
                .fromState("NEW")
                .toState("ASSIGNED")
                .details("Assigned request to David Miller for 2026-09-29 (10:00 AM - 12:00 PM)")
                .build());

        // 6. Seed Notifications
        notificationRepository.save(Notification.builder()
                .userId(dispatcher.getId())
                .targetRole("DISPATCHER")
                .title("New Service Request Created")
                .message("Urgent request #SR-8093 submitted for Server Room Breaker")
                .requestId("SR-8093")
                .type("ALERT")
                .isRead(false)
                .build());
    }
}
