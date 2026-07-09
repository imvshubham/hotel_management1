package com.hotel.reservation.client;

import com.hotel.reservation.dto.RoomDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "room-service")
public interface RoomClient {
    @GetMapping("/rooms")
    List<RoomDto> getAllRooms();

    @GetMapping("/rooms/{id}")
    RoomDto getRoomById(@PathVariable("id") String id);

    @PutMapping("/rooms/{id}/status")
    void updateRoomStatus(@PathVariable("id") String id, @RequestParam("status") String status);
}
