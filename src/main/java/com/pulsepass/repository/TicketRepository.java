package com.pulsepass.repository;

import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;
import java.time.*;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    Optional<Ticket> findByTicketCode(String ticketCode);

    List<Ticket> findByUserEmail(String userEmail);

    List<Ticket> findByUserEmailAndStatus(String userEmail, TicketStatus status);

    List<Ticket> findByEventCodeAndStatus(String eventCode, TicketStatus status);

    
}
    