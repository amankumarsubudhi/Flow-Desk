package com.flowdesk.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "technician_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "technician_skills", joinColumns = @JoinColumn(name = "technician_id"))
    @Column(name = "category_id")
    @Builder.Default
    private Set<String> skillCategoryIds = new HashSet<>();

    @Builder.Default
    private boolean available = true;

    @Builder.Default
    private Double rating = 5.0;

    @Builder.Default
    private Integer completedJobsCount = 0;

    private String currentLocation;
}
