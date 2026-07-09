package com.hotel.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    private String reservationId;
    private String cardName;
    private String cardNumber;
    private String expiryDate;
    private String expiry; // supports frontend key directly
    private String cvv;
}
