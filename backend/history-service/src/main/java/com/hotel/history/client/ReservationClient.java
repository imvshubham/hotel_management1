package com.hotel.history.client;

import com.hotel.history.dto.ReservationHistoryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "reservation-service")
public interface ReservationClient {
    @GetMapping("/reservations")
    List<ReservationHistoryDto> getAllReservations();

    @GetMapping("/reservations/user/{customerId}")
    List<ReservationHistoryDto> getReservationsByCustomerId(@PathVariable("customerId") String customerId);
}
