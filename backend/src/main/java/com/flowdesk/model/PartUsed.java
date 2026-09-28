package com.flowdesk.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parts_used")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartUsed {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Builder.Default
    private Integer quantity = 1;

    @Builder.Default
    private Double unitCost = 0.0;
}
