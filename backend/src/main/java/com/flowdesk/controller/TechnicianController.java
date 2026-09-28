package com.flowdesk.controller;

import com.flowdesk.model.TechnicianProfile;
import com.flowdesk.repository.TechnicianProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@CrossOrigin(origins = "*")
public class TechnicianController {

    private final TechnicianProfileRepository technicianRepository;

    public TechnicianController(TechnicianProfileRepository technicianRepository) {
        this.technicianRepository = technicianRepository;
    }

    @GetMapping
    public ResponseEntity<List<TechnicianProfile>> getAllTechnicians(
            @RequestParam(required = false) Boolean available) {
        if (available != null) {
            return ResponseEntity.ok(technicianRepository.findByAvailable(available));
        }
        return ResponseEntity.ok(technicianRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TechnicianProfile> getTechnicianById(@PathVariable String id) {
        return technicianRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
