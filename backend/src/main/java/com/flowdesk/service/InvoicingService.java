package com.flowdesk.service;

import com.flowdesk.model.*;
import com.flowdesk.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InvoicingService {

    private final InvoiceRepository invoiceRepository;
    private final double configuredTaxRate;

    public InvoicingService(InvoiceRepository invoiceRepository,
                            @Value("${flowdesk.billing.tax-rate-percentage:18.0}") double taxRatePercentage) {
        this.invoiceRepository = invoiceRepository;
        this.configuredTaxRate = taxRatePercentage / 100.0;
    }

    /**
     * Server-side calculation only (PRD Section 5.6)
     */
    public Invoice generateInvoice(ServiceRequest request, WorkReport workReport) {
        double serviceCharge = request.getCategory() != null && request.getCategory().getBaseCharge() != null
                ? request.getCategory().getBaseCharge() : 500.0;

        double partsTotal = 0.0;
        if (workReport.getPartsUsed() != null) {
            for (PartUsed part : workReport.getPartsUsed()) {
                int qty = part.getQuantity() != null ? part.getQuantity() : 1;
                double cost = part.getUnitCost() != null ? part.getUnitCost() : 0.0;
                partsTotal += (qty * cost);
            }
        }

        double laborTotal = workReport.getLaborCost() != null ? workReport.getLaborCost() : 0.0;
        double additionalCharges = workReport.getAdditionalCharges() != null ? workReport.getAdditionalCharges() : 0.0;

        double subtotal = serviceCharge + partsTotal + laborTotal + additionalCharges;
        double taxAmount = Math.round(subtotal * configuredTaxRate);
        double totalAmount = subtotal + taxAmount;

        Invoice invoice = Invoice.builder()
                .serviceCharge(serviceCharge)
                .partsTotal(partsTotal)
                .laborTotal(laborTotal)
                .additionalCharges(additionalCharges)
                .subtotal(subtotal)
                .taxRate(configuredTaxRate)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .status(InvoiceStatus.PENDING)
                .build();

        return invoiceRepository.save(invoice);
    }

    public Invoice processPayment(Invoice invoice, String paymentMethod) {
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(LocalDateTime.now());
        invoice.setPaymentMethod(paymentMethod);
        return invoiceRepository.save(invoice);
    }
}
