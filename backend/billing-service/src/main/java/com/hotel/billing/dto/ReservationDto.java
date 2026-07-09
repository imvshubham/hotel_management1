package com.hotel.billing.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDto {
    private String id;
    private String customerId;
    private double totalAmount;
    private String roomType;
}
