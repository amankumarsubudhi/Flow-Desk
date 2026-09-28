package com.flowdesk.controller;

import com.flowdesk.config.JwtTokenProvider;
import com.flowdesk.model.Role;
import com.flowdesk.model.TechnicianProfile;
import com.flowdesk.model.User;
import com.flowdesk.repository.TechnicianProfileRepository;
import com.flowdesk.repository.UserRepository;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class AdminUserController {

    private final UserRepository userRepository;
    private final TechnicianProfileRepository technicianRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(UserRepository userRepository,
            TechnicianProfileRepository technicianRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.technicianRepository = technicianRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private User verifyAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        User user = (User) auth.getPrincipal();
        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
        return user;
    }

    @GetMapping
    public ResponseEntity<?> listStaffUsers() {
        verifyAdmin();
        List<User> staff = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.TECHNICIAN || u.getRole() == Role.DISPATCHER)
                .toList();
        return ResponseEntity.ok(staff);
    }

    @PostMapping
    public ResponseEntity<?> createStaffUser(@RequestBody CreateStaffRequest request) {
        verifyAdmin();

        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }
        if (request.getRole() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
        }
        if (request.getRole() != Role.TECHNICIAN && request.getRole() != Role.DISPATCHER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be TECHNICIAN or DISPATCHER");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .active(true)
                .build();

        User saved = userRepository.save(user);

        // If TECHNICIAN, create a TechnicianProfile
        if (request.getRole() == Role.TECHNICIAN) {
            technicianRepository.findByUserId(saved.getId())
                    .orElseGet(() -> technicianRepository.save(TechnicianProfile.builder()
                            .user(saved)
                            .skillCategoryIds(Set.of("cat_hvac", "cat_electrical", "cat_appliance"))
                            .available(true)
                            .rating(5.0)
                            .completedJobsCount(0)
                            .currentLocation("Central District")
                            .build()));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaffUser(@PathVariable String id, @RequestBody UpdateStaffRequest request) {
        verifyAdmin();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() != Role.TECHNICIAN && user.getRole() != Role.DISPATCHER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Can only update staff accounts (TECHNICIAN/DISPATCHER)");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String normalizedEmail = request.getEmail().trim().toLowerCase();
            if (!normalizedEmail.equals(user.getEmail()) && userRepository.existsByEmail(normalizedEmail)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
            }
            user.setEmail(normalizedEmail);
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getRole() != null) {
            if (request.getRole() != Role.TECHNICIAN && request.getRole() != Role.DISPATCHER) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be TECHNICIAN or DISPATCHER");
            }
            user.setRole(request.getRole());
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggleUserActive(@PathVariable String id) {
        verifyAdmin();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot deactivate admin accounts");
        }

        user.setActive(!user.isActive());
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @Data
    public static class CreateStaffRequest {
        private String name;
        private String email;
        private String password;
        private Role role;
        private String phone;
    }

    @Data
    public static class UpdateStaffRequest {
        private String name;
        private String email;
        private String password;
        private Role role;
        private String phone;
    }
}
