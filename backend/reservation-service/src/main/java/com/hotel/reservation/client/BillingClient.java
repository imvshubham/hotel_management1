package com.hotel.reservation.client;

import com.hotel.reservation.dto.BillingRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "billing-service")
public interface BillingClient {
    @PostMapping("/billing/generate")
    void generateBill(@RequestBody BillingRequest request);

    @org.springframework.web.bind.annotation.GetMapping("/billing/{reservationId}")
    com.hotel.reservation.dto.BillingResponse getBillingByReservationId(@org.springframework.web.bind.annotation.PathVariable("reservationId") String reservationId);
}
