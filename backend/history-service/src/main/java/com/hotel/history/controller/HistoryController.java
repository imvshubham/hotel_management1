package com.hotel.history.controller;

import com.hotel.history.client.ReservationClient;
import com.hotel.history.dto.ReservationHistoryDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/history")
public class HistoryController {

    @Autowired
    private ReservationClient reservationClient;

    @GetMapping("/user/{customerId}")
    public ResponseEntity<List<ReservationHistoryDto>> getUserHistory(@PathVariable String customerId) {
        try {
            List<ReservationHistoryDto> history = reservationClient.getReservationsByCustomerId(customerId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            System.err.println("Error calling reservation-service from history-service: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<ReservationHistoryDto>> getAllHistory() {
        try {
            List<ReservationHistoryDto> history = reservationClient.getAllReservations();
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            System.err.println("Error calling reservation-service from history-service: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
