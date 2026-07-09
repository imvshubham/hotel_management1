package com.hotel.room.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {
    @Id
    private String id; // e.g. "101", "102"

    @Column(nullable = false)
    private String type; // "Single Room", "Double Room", "Deluxe Suite", "Executive Penthouse"

    @Column(nullable = false)
    private double price;

    @Column(nullable = false)
    private String status; // "VACANT", "OCCUPIED", "MAINTENANCE"
}
