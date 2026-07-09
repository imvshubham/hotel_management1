package com.hotel.complaint.controller;

import com.hotel.complaint.entity.Complaint;
import com.hotel.complaint.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintRepository.findAll());
    }

    @GetMapping("/user/{customerId}")
    public ResponseEntity<List<Complaint>> getComplaintsByCustomerId(@PathVariable String customerId) {
        return ResponseEntity.ok(complaintRepository.findByCustomerId(customerId));
    }

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@RequestBody Complaint complaint) {
        complaint.setStatus("PENDING");
        Complaint saved = complaintRepository.save(complaint);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveComplaint(@PathVariable String id) {
        Optional<Complaint> complaintOpt = complaintRepository.findById(id);
        if (complaintOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Complaint complaint = complaintOpt.get();
        complaint.setStatus("RESOLVED");
        Complaint saved = complaintRepository.save(complaint);
        return ResponseEntity.ok(saved);
    }
}
