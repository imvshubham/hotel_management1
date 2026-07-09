package com.hotel.room.controller;

import com.hotel.room.entity.Room;
import com.hotel.room.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/rooms")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable String id) {
        Optional<Room> roomOpt = roomRepository.findById(id);
        return roomOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateRoomStatus(
            @PathVariable String id,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        
        String targetStatus = status;
        if (targetStatus == null && body != null) {
            targetStatus = body.get("status");
        }

        if (targetStatus == null) {
            return ResponseEntity.badRequest().body("Status is required (either as query param or JSON body field).");
        }

        Optional<Room> roomOpt = roomRepository.findById(id);
        if (roomOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Room room = roomOpt.get();
        room.setStatus(targetStatus.toUpperCase());
        roomRepository.save(room);
        return ResponseEntity.ok(room);
    }
}
