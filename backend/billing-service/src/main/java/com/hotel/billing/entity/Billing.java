package com.hotel.billing.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "billings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Billing {
    @Id
    private String id; // format: "BILL-XXXX"

    @Column(nullable = false)
    private String reservationId;

    @Column(nullable = false)
    private String customerId;

    @Column(nullable = false)
    private double roomCharges;

    @Column(nullable = false)
    private double extraServices;

    @Column(nullable = false)
    private double tax;

    @Column(nullable = false)
    private double totalAmount;

    @JsonProperty("isPaid")
    @Column(nullable = false)
    private boolean isPaid;

    private String paymentDate;

    private String cardMasked;

    @PrePersist
    public void generateId() {
        if (this.id == null) {
            this.id = "BILL-" + (int)(Math.random() * 9000 + 1000);
        }
    }
}
