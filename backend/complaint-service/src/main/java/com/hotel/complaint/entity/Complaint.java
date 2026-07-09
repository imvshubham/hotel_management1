package com.hotel.complaint.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {
    @Id
    private String id; // format: "CMP-XXXX"

    @Column(nullable = false)
    private String type; // "Plumbing", "Electrical", "Housekeeping", "Room Service", "Other"

    @Column(nullable = false)
    private String roomNumber;

    @Column(nullable = false)
    private String contactNumber;

    @Column(nullable = false)
    private String customerId;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String status; // "PENDING", "RESOLVED"

    @Column(nullable = false)
    private String createdAt;

    @PrePersist
    public void init() {
        if (this.id == null) {
            this.id = "CMP-" + (int)(Math.random() * 9000 + 1000);
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDate.now().toString();
        }
        if (this.status == null) {
            this.status = "PENDING";
        }
    }
}
