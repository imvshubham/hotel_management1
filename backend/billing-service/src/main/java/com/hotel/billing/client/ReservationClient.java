package com.hotel.billing.client;

import com.hotel.billing.dto.ReservationDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "reservation-service")
public interface ReservationClient {
    @GetMapping("/reservations/{id}")
    ReservationDto getReservationById(@PathVariable("id") String id);
}
