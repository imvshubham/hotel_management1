package com.hotel.reservation.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomDto {
    private String id;
    private String type;
    private double price;
    private String status;
}
