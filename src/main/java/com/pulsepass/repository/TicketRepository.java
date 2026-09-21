package com.pulsepass.repository;

import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.*;
import java.time.*;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    Optional<Ticket> findByTicketCode(String ticketCode);

    List<Ticket> findByUserEmail(String userEmail);

    List<Ticket> findByUserEmailAndStatus(String userEmail, TicketStatus status);

    @Query("""
            select t
            from Ticket t
            join t.event e
            where e.eventCode = :eventCode
            and t.status = :status
            """)
    List<Ticket> findByEventCodeAndStatus(@Param("eventCode") String eventCode,
                                           @Param("status") TicketStatus status);

     @Query("""
            select count(t)
            from Ticket t
            join t.event e
            where e.eventCode = :eventCode
            and t.status = com.pulsepass.domain.TicketStatus.PAID
            """)
    long countPaidTicketsByEventCode(@Param("eventCode") String eventCode);

    @Query("""
            select t
            from Ticket t
            join t.event e
            where e.eventDate > :date
            order by e.eventDate asc
            """)
    List<Ticket> findByEventDateAfter(@Param("date") LocalDateTime date);
}