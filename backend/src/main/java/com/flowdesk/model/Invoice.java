package com.flowdesk.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private Double serviceCharge;

    @Column(nullable = false)
    private Double partsTotal;

    @Column(nullable = false)
    private Double laborTotal;

    @Column(nullable = false)
    private Double additionalCharges;

    @Column(nullable = false)
    private Double subtotal;

    @Column(nullable = false)
    private Double taxRate; // 0.18

    @Column(nullable = false)
    private Double taxAmount;

    @Column(nullable = false)
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.PENDING;

    private LocalDateTime paidAt;

    private String paymentMethod;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
