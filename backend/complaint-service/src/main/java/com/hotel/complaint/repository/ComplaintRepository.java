package com.hotel.complaint.repository;

import com.hotel.complaint.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, String> {
    List<Complaint> findByCustomerId(String customerId);
}
