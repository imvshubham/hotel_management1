package com.hotel.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillingResponse {
    private String id;
    private String reservationId;
    private String customerId;
    private double totalAmount;

    @JsonProperty("isPaid")
    private boolean isPaid;
}
