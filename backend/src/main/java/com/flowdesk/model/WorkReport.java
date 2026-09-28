package com.flowdesk.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "work_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 1000)
    private String problemIdentified;

    @Column(nullable = false, length = 2000)
    private String workPerformed;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "work_report_id")
    @Builder.Default
    private List<PartUsed> partsUsed = new ArrayList<>();

    @Builder.Default
    private Double laborCost = 0.0;

    @Builder.Default
    private Double additionalCharges = 0.0;

    @Column(length = 2000)
    private String notes;

    @ElementCollection
    @CollectionTable(name = "work_report_before_images", joinColumns = @JoinColumn(name = "work_report_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> beforeImages = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "work_report_after_images", joinColumns = @JoinColumn(name = "work_report_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> afterImages = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime completedAt;
}
