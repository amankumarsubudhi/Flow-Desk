package com.flowdesk.controller;

import com.flowdesk.model.ServiceCategory;
import com.flowdesk.repository.ServiceCategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    private final ServiceCategoryRepository categoryRepository;

    public CategoryController(ServiceCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<ServiceCategory>> getAllCategories(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        if (activeOnly) {
            return ResponseEntity.ok(categoryRepository.findByActiveTrue());
        }
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<ServiceCategory> createCategory(@RequestBody ServiceCategory category) {
        if (category.getId() == null || category.getId().isBlank()) {
            category.setId("cat_" + category.getName().toLowerCase().replaceAll("[^a-z0-9]", "_"));
        }
        ServiceCategory saved = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ServiceCategory> toggleCategory(@PathVariable String id) {
        return categoryRepository.findById(id)
                .map(c -> {
                    c.setActive(!c.isActive());
                    return ResponseEntity.ok(categoryRepository.save(c));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
