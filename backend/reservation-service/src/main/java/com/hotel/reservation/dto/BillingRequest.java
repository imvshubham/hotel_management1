package com.hotel.reservation.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingRequest {
    private String reservationId;
    private String customerId;
    private double roomCharges;
    private double extraServices;
    private double tax;
    private double totalAmount;
}
