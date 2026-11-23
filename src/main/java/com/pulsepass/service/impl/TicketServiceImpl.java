package com.pulsepass.service.impl;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.TicketStatus;
import com.pulsepass.domain.User;
import com.pulsepass.domain.UserProfile;
import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.TicketMapper;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.service.TicketCodeGenerator;
import com.pulsepass.service.TicketPricingPolicy;
import com.pulsepass.service.TicketService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TicketMapper ticketMapper;
    private final TicketPricingPolicy pricingPolicy;
    private final TicketCodeGenerator codeGenerator;
    private final Clock clock;

    public TicketServiceImpl(TicketRepository ticketRepository,
                              UserRepository userRepository,
                              EventRepository eventRepository,
                              TicketMapper ticketMapper,
                              TicketPricingPolicy pricingPolicy,
                              TicketCodeGenerator codeGenerator,
                              Clock clock) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.ticketMapper = ticketMapper;
        this.pricingPolicy = pricingPolicy;
        this.codeGenerator = codeGenerator;
        this.clock = clock;
    }

    @Override
    @Transactional
    public TicketResponse purchase(PurchaseTicketRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.userEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.userEmail()));

        if (!user.isActive()) {
            throw new BusinessRuleException("Inactive user cannot purchase tickets: " + request.userEmail());
        }

        Event event = eventRepository.findByEventCode(request.eventCode())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + request.eventCode()));

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessRuleException(
                    "Tickets can only be purchased for PUBLISHED events. Current status: " + event.getStatus());
        }

        LocalDateTime now = LocalDateTime.now(clock);

        if (!event.getEventDate().isAfter(now)) {
            throw new BusinessRuleException("Cannot purchase a ticket for an event that has already occurred");
        }

        validateMinimumAge(user, event);

        long paidTickets = ticketRepository.countPaidTicketsByEventCode(event.getEventCode());
        int capacity = event.getVenue().getCapacity();
        if (paidTickets >= capacity) {
            throw new BusinessRuleException("Event has no remaining capacity: " + event.getEventCode());
        }

        BigDecimal price = pricingPolicy.calculatePrice(request.type());

        String ticketCode = codeGenerator.generate(event.getEventCode());

        Ticket ticket = new Ticket(ticketCode, request.type(), price, TicketStatus.PAID, now, user, event);
        Ticket saved = ticketRepository.save(ticket);

        if (paidTickets + 1 == capacity) {
            event.setStatus(EventStatus.SOLD_OUT);
            eventRepository.save(event);
        }

        return ticketMapper.toResponse(saved);
    }

    private void validateMinimumAge(User user, Event event) {
        if (event.getMinimumAge() == null || event.getMinimumAge() <= 0) {
            return;
        }

        UserProfile profile = user.getUserProfile();
        if (profile == null || profile.getBirthDate() == null) {
            throw new BusinessRuleException(
                    "User birth date is required to validate the minimum age for this event");
        }

        int age = Period.between(profile.getBirthDate(), event.getEventDate().toLocalDate()).getYears();
        if (age < event.getMinimumAge()) {
            throw new BusinessRuleException("User does not meet minimum age for event: " + event.getEventCode());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse findByCode(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode));
        return ticketMapper.toResponse(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> findByUserEmail(String email) {
        return ticketMapper.toResponseList(
                ticketRepository.findByUserEmailIgnoreCaseOrderByPurchaseDateDesc(email));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> findPaidTicketsByEvent(String eventCode) {
        return ticketMapper.toResponseList(
                ticketRepository.findByEventCodeAndStatus(eventCode, TicketStatus.PAID));
    }

    @Override
    @Transactional
    public TicketResponse cancel(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode));

        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException(
                    "Only PAID tickets can be cancelled. Current status: " + ticket.getStatus());
        }

        if (!ticket.getEvent().getEventDate().isAfter(LocalDateTime.now(clock))) {
            throw new BusinessRuleException("Cannot cancel a ticket after the event date");
        }

        ticket.setStatus(TicketStatus.CANCELLED);
        Ticket saved = ticketRepository.save(ticket);
        return ticketMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TicketResponse markAsUsed(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketCode));

        if (ticket.getStatus() != TicketStatus.PAID) {
            throw new BusinessRuleException(
                    "Only PAID tickets can be marked as used. Current status: " + ticket.getStatus());
        }

        ticket.setStatus(TicketStatus.USED);
        Ticket saved = ticketRepository.save(ticket);
        return ticketMapper.toResponse(saved);
    }
}
