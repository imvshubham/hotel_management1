package com.hotel.billing.controller;

import com.hotel.billing.dto.PaymentRequest;
import com.hotel.billing.entity.Billing;
import com.hotel.billing.repository.BillingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/billing")
public class BillingController {

    @Autowired
    private BillingRepository billingRepository;

    @Autowired
    private com.hotel.billing.client.ReservationClient reservationClient;

    @GetMapping
    public ResponseEntity<java.util.List<Billing>> getAllBillings() {
        return ResponseEntity.ok(billingRepository.findAll());
    }

    @GetMapping("/{reservationId}")
    public ResponseEntity<Billing> getBillingByReservationId(@PathVariable String reservationId) {
        Optional<Billing> billingOpt = billingRepository.findByReservationId(reservationId);
        return billingOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateBill(@RequestBody Billing billingRequest) {
        // If billing already exists for this reservation, return it
        Optional<Billing> existing = billingRepository.findByReservationId(billingRequest.getReservationId());
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }

        // Fetch reservation details if fields are unpopulated (manual invoice trigger case)
        if (billingRequest.getCustomerId() == null || billingRequest.getTotalAmount() == 0.0) {
            try {
                com.hotel.billing.dto.ReservationDto res = reservationClient.getReservationById(billingRequest.getReservationId());
                if (res != null) {
                    billingRequest.setCustomerId(res.getCustomerId());
                    double total = res.getTotalAmount();
                    double charges = Math.round((total / 1.12) * 100.0) / 100.0;
                    double tax = Math.round((total - charges) * 100.0) / 100.0;
                    billingRequest.setRoomCharges(charges);
                    billingRequest.setExtraServices(0.0);
                    billingRequest.setTax(tax);
                    billingRequest.setTotalAmount(total);
                }
            } catch (Exception e) {
                System.err.println("Could not lookup reservation details via feign client: " + e.getMessage());
            }
        }

        billingRequest.setPaid(false);
        Billing saved = billingRepository.save(billingRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/pay")
    public ResponseEntity<?> payBill(@RequestBody PaymentRequest paymentRequest) {
        Optional<Billing> billingOpt = billingRepository.findByReservationId(paymentRequest.getReservationId());
        if (billingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Billing record not found for reservation ID.");
        }

        Billing billing = billingOpt.get();
        if (billing.isPaid()) {
            return ResponseEntity.ok(billing);
        }

        String cardNumber = paymentRequest.getCardNumber();
        String masked = "xxxx-xxxx-xxxx-xxxx";
        if (cardNumber != null && cardNumber.length() >= 4) {
            masked = "xxxx-xxxx-xxxx-" + cardNumber.substring(cardNumber.length() - 4);
        }

        billing.setPaid(true);
        billing.setPaymentDate(LocalDate.now().toString());
        billing.setCardMasked(masked);

        Billing updated = billingRepository.save(billing);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/invoice/{id}")
    public ResponseEntity<Billing> getInvoiceById(@PathVariable String id) {
        Optional<Billing> billingOpt = billingRepository.findById(id);
        return billingOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
