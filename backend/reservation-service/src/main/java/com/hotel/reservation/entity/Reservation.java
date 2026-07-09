package com.hotel.reservation.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {
    @Id
    private String id; // format: "RES-XXXX"

    @Column(nullable = false)
    private String checkIn;

    @Column(nullable = false)
    private String checkOut;

    @Column(nullable = false)
    private String roomType;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerEmail;

    @Column(nullable = false)
    private String customerPhone;

    @Column(nullable = false)
    private String customerId;

    private String roomNumber; // Assigned on approval

    @Column(nullable = false)
    private String status; // "PENDING", "APPROVED", "REJECTED"

    @Column(nullable = false)
    private double totalAmount;

    @Column(nullable = false)
    private String bookingDate;

    @PrePersist
    public void generateIdAndBookingDate() {
        if (this.id == null) {
            this.id = "RES-" + (int)(Math.random() * 9000 + 1000);
        }
        if (this.bookingDate == null) {
            this.bookingDate = LocalDate.now().toString();
        }
    }
}
