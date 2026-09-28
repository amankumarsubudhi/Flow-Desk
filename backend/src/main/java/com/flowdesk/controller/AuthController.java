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

import java.util.Collections;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final TechnicianProfileRepository technicianRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository,
            TechnicianProfileRepository technicianRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.technicianRepository = technicianRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "User account is inactive. Please contact administrator.");
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", user));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        // Public registration always enforces CUSTOMER role.
        // Only admins can create TECHNICIAN/DISPATCHER via AdminUserController.
        Role userRole = Role.CUSTOMER;

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .avatar(request.getAvatar() != null ? request.getAvatar()
                        : (userRole == Role.CUSTOMER
                                ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
                                : userRole == Role.TECHNICIAN
                                        ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                                        : userRole == Role.DISPATCHER
                                                ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                                                : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"))
                .active(true)
                .build();

        User saved = userRepository.save(user);

        // If registered role is TECHNICIAN, ensure a TechnicianProfile exists
        if (userRole == Role.TECHNICIAN) {
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

        String token = tokenProvider.generateToken(saved.getEmail(), saved.getRole().name(), saved.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "token", token,
                "user", saved));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        User user = (User) auth.getPrincipal();
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private Role role;
        private String phone;
        private String avatar;
    }
}
