package com.hotel.billing.repository;

import com.hotel.billing.entity.Billing;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BillingRepository extends JpaRepository<Billing, String> {
    Optional<Billing> findByReservationId(String reservationId);
}
