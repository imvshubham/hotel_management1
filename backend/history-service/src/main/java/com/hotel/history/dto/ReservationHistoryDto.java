package com.hotel.history.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationHistoryDto {
    private String id;
    private String checkIn;
    private String checkOut;
    private String roomType;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerId;
    private String roomNumber;
    private String status;
    private double totalAmount;
    private String bookingDate;
}
