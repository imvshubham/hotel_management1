package com.hotel.reservation.controller;

import com.hotel.reservation.client.BillingClient;
import com.hotel.reservation.client.RoomClient;
import com.hotel.reservation.dto.BillingRequest;
import com.hotel.reservation.dto.RoomDto;
import com.hotel.reservation.entity.Reservation;
import com.hotel.reservation.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private RoomClient roomClient;

    @Autowired
    private BillingClient billingClient;

    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(reservationRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable String id) {
        Optional<Reservation> reservationOpt = reservationRepository.findById(id);
        return reservationOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{customerId}")
    public ResponseEntity<List<Reservation>> getReservationsByCustomerId(@PathVariable String customerId) {
        return ResponseEntity.ok(reservationRepository.findByCustomerId(customerId));
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody Reservation reservation) {
        reservation.setStatus("PENDING");
        Reservation saved = reservationRepository.save(reservation);

        // Generate initial unpaid Billing record immediately for checkout / immediate payment capability
        double total = saved.getTotalAmount();
        double charges = Math.round((total / 1.12) * 100.0) / 100.0;
        double tax = Math.round((total - charges) * 100.0) / 100.0;

        BillingRequest billingRequest = BillingRequest.builder()
                .reservationId(saved.getId())
                .customerId(saved.getCustomerId())
                .roomCharges(charges)
                .extraServices(0.0)
                .tax(tax)
                .totalAmount(total)
                .build();

        try {
            billingClient.generateBill(billingRequest);
        } catch (Exception e) {
            System.err.println("Error generating initial bill upon reservation creation: " + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @RequestMapping(value = {"/{id}", "/{id}/status"}, method = RequestMethod.PUT)
    public ResponseEntity<?> updateReservationStatus(@PathVariable String id, @RequestBody Reservation updateRequest) {
        Optional<Reservation> reservationOpt = reservationRepository.findById(id);
        if (reservationOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Reservation reservation = reservationOpt.get();
        String oldStatus = reservation.getStatus();
        String newStatus = updateRequest.getStatus();

        if (newStatus != null) {
            reservation.setStatus(newStatus.toUpperCase());
        }

        // Logical workflow for APPROVED state
        if ("APPROVED".equalsIgnoreCase(newStatus) && !"APPROVED".equalsIgnoreCase(oldStatus)) {
            // Check if bill has been paid first
            try {
                com.hotel.reservation.dto.BillingResponse billing = billingClient.getBillingByReservationId(reservation.getId());
                if (billing == null || !billing.isPaid()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Cannot approve reservation: Guest payment is pending. Payment must be completed before assigning a room.");
                }
            } catch (Exception e) {
                System.err.println("Error calling billing-service via Feign: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Cannot verify payment status: billing-service is unreachable.");
            }

            // 1. Find a vacant room matching requested room type
            List<RoomDto> rooms = roomClient.getAllRooms();
            Optional<RoomDto> vacantRoomOpt = rooms.stream()
                    .filter(r -> r.getType().equalsIgnoreCase(reservation.getRoomType()) && "VACANT".equalsIgnoreCase(r.getStatus()))
                    .findFirst();

            if (vacantRoomOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("No vacant rooms of type '" + reservation.getRoomType() + "' are available.");
            }

            RoomDto room = vacantRoomOpt.get();
            reservation.setRoomNumber(room.getId());

            // 2. Mark the room occupied
            roomClient.updateRoomStatus(room.getId(), "OCCUPIED");

            // 3. Generate Bill
            double total = reservation.getTotalAmount();
            double charges = Math.round((total / 1.12) * 100.0) / 100.0;
            double tax = Math.round((total - charges) * 100.0) / 100.0;

            BillingRequest billingRequest = BillingRequest.builder()
                    .reservationId(reservation.getId())
                    .customerId(reservation.getCustomerId())
                    .roomCharges(charges)
                    .extraServices(0.0)
                    .tax(tax)
                    .totalAmount(total)
                    .build();

            try {
                billingClient.generateBill(billingRequest);
            } catch (Exception e) {
                System.err.println("Error triggering billing-service: " + e.getMessage());
            }
        }

        // Logic for REJECTED state (if it had a room, vacate it)
        if ("REJECTED".equalsIgnoreCase(newStatus) && "APPROVED".equalsIgnoreCase(oldStatus) && reservation.getRoomNumber() != null) {
            roomClient.updateRoomStatus(reservation.getRoomNumber(), "VACANT");
            reservation.setRoomNumber(null);
        }

        Reservation saved = reservationRepository.save(reservation);
        return ResponseEntity.ok(saved);
    }
}
