package com.pulsepass.service;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.EventCategory;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.TicketStatus;
import com.pulsepass.domain.TicketType;
import com.pulsepass.domain.User;
import com.pulsepass.domain.UserProfile;
import com.pulsepass.domain.Venue;
import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.TicketMapper;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.service.impl.TicketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceImplTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private TicketMapper ticketMapper;

    @Mock
    private TicketPricingPolicy pricingPolicy;

    @Mock
    private TicketCodeGenerator codeGenerator;

    private TicketServiceImpl ticketService;

    private final Clock fixedClock =
            Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC);

    private Venue venue;
    private Event event;
    private User activeAdultUser;

    @BeforeEach
    void setUp() {
        ticketService = new TicketServiceImpl(ticketRepository, userRepository, eventRepository,
                ticketMapper, pricingPolicy, codeGenerator, fixedClock);

        venue = new Venue("VEN-SMR-01", "Marina Convention Center", "Santa Marta", "Calle 1", 3);

        event = new Event("CMF-2026", "Caribbean Music Fest 2026", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.now(fixedClock).plusMonths(6), 18);
        event.setVenue(venue);

        activeAdultUser = new User("andrea", "andrea@email.com");
        UserProfile profile = new UserProfile("Andrea", "Gomez");
        profile.setBirthDate(LocalDate.of(2001, 1, 1)); // 25 años al momento del evento
        activeAdultUser.assignProfile(profile);
    }

    private PurchaseTicketRequest validRequest() {
        return new PurchaseTicketRequest("andrea@email.com", "CMF-2026", TicketType.GENERAL);
    }

    @Test
    void purchase_compraValida_creaTicketPaid() {
        // ARRANGE
        when(userRepository.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.of(activeAdultUser));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(ticketRepository.countPaidTicketsByEventCode("CMF-2026")).thenReturn(0L);
        when(pricingPolicy.calculatePrice(TicketType.GENERAL)).thenReturn(new BigDecimal("100000.00"));
        when(codeGenerator.generate("CMF-2026")).thenReturn("TCK-CMF-2026-ABC123");
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(ticketMapper.toResponse(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket t = invocation.getArgument(0);
            return new TicketResponse(1L, t.getTicketCode(), t.getType(), t.getPrice(), t.getStatus(),
                    t.getPurchaseDate(), t.getUser().getEmail(), t.getEvent().getEventCode(), t.getEvent().getName());
        });

        TicketResponse result = ticketService.purchase(validRequest());

        assertThat(result.status()).isEqualTo(TicketStatus.PAID);
        assertThat(result.price()).isEqualByComparingTo("100000.00");
        verify(ticketRepository).save(any(Ticket.class));
        verify(eventRepository, never()).save(any()); // no se agota capacidad (0 -> 1 de 3)
    }

    @Test
    void purchase_usuarioInexistente_lanzaResourceNotFoundException() {
        when(userRepository.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.purchase(validRequest()))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void purchase_usuarioInactivo_lanzaBusinessRuleException() {
        activeAdultUser.setActive(false);
        when(userRepository.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.of(activeAdultUser));

        assertThatThrownBy(() -> ticketService.purchase(validRequest()))
                .isInstanceOf(BusinessRuleException.class);
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void purchase_eventoDraft_lanzaBusinessRuleException() {
        event.setStatus(EventStatus.DRAFT);
        when(userRepository.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.of(activeAdultUser));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> ticketService.purchase(validRequest()))
                .isInstanceOf(BusinessRuleException.class);
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void purchase_eventoCancelled_lanzaBusinessRuleException() {
        event.setStatus(EventStatus.CANCELLED);
        when(userRepository.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.of(activeAdultUser));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> ticketService.purchase(validRequest()))
                .isInstanceOf(BusinessRuleException.class);
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void purchase_usuarioMenorDeEdad_lanzaBusinessRuleException() {
        User minorUser = new User("laura", "laura@email.com");
        UserProfile minorProfile = new UserProfile("Laura", "Diaz");
        minorProfile.setBirthDate(LocalDate.of(2009, 1, 1)); // 17 años al momento del evento
        minorUser.assignProfile(minorProfile);

        when(userRepository.findByEmailIgnoreCase("laura@email.com")).thenReturn(Optional.of(minorUser));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));

        PurchaseTicketRequest request = new PurchaseTicketRequest("laura@email.com", "CMF-2026", TicketType.GENERAL);

        assertThatThrownBy(() -> ticketService.purchase(request))
                .isInstanceOf(BusinessRuleException.class);
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void purchase_eventoSinCapacidad_lanzaBusinessRuleException() {
        when(userRepository.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.of(activeAdultUser));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(ticketRepository.countPaidTicketsByEventCode("CMF-2026")).thenReturn(3L); // == capacity

        assertThatThrownBy(() -> ticketService.purchase(validRequest()))
                .isInstanceOf(BusinessRuleException.class);
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void purchase_ultimoTicketDisponible_guardaTicketYCambiaEventoASoldOut() {
        when(userRepository.findByEmailIgnoreCase("andrea@email.com")).thenReturn(Optional.of(activeAdultUser));
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(ticketRepository.countPaidTicketsByEventCode("CMF-2026")).thenReturn(2L); // capacity = 3
        when(pricingPolicy.calculatePrice(TicketType.GENERAL)).thenReturn(new BigDecimal("100000.00"));
        when(codeGenerator.generate("CMF-2026")).thenReturn("TCK-CMF-2026-LAST");
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(ticketMapper.toResponse(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket t = invocation.getArgument(0);
            return new TicketResponse(1L, t.getTicketCode(), t.getType(), t.getPrice(), t.getStatus(),
                    t.getPurchaseDate(), t.getUser().getEmail(), t.getEvent().getEventCode(), t.getEvent().getName());
        });

        ticketService.purchase(validRequest());

        verify(ticketRepository).save(any(Ticket.class));

        ArgumentCaptor<Event> eventCaptor = ArgumentCaptor.forClass(Event.class);
        verify(eventRepository).save(eventCaptor.capture());
        assertThat(eventCaptor.getValue().getStatus()).isEqualTo(EventStatus.SOLD_OUT);
    }

    @Test
    void cancel_ticketPaid_cambiaACancelled() {
        Ticket ticket = new Ticket("TCK-001", TicketType.GENERAL, new BigDecimal("100000.00"),
                TicketStatus.PAID, LocalDateTime.now(fixedClock), activeAdultUser, event);
        when(ticketRepository.findByTicketCode("TCK-001")).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(ticketMapper.toResponse(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket t = invocation.getArgument(0);
            return new TicketResponse(1L, t.getTicketCode(), t.getType(), t.getPrice(), t.getStatus(),
                    t.getPurchaseDate(), t.getUser().getEmail(), t.getEvent().getEventCode(), t.getEvent().getName());
        });

        TicketResponse result = ticketService.cancel("TCK-001");

        assertThat(result.status()).isEqualTo(TicketStatus.CANCELLED);
        verify(ticketRepository).save(ticket);
    }

    @Test
    void cancel_ticketUsed_lanzaBusinessRuleException() {
        Ticket ticket = new Ticket("TCK-002", TicketType.GENERAL, new BigDecimal("100000.00"),
                TicketStatus.USED, LocalDateTime.now(fixedClock), activeAdultUser, event);
        when(ticketRepository.findByTicketCode("TCK-002")).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.cancel("TCK-002"))
                .isInstanceOf(BusinessRuleException.class);
        verify(ticketRepository, never()).save(any());
    }

    @Test
    void markAsUsed_ticketPaid_cambiaAUsed() {
        Ticket ticket = new Ticket("TCK-003", TicketType.GENERAL, new BigDecimal("100000.00"),
                TicketStatus.PAID, LocalDateTime.now(fixedClock), activeAdultUser, event);
        when(ticketRepository.findByTicketCode("TCK-003")).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(ticketMapper.toResponse(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket t = invocation.getArgument(0);
            return new TicketResponse(1L, t.getTicketCode(), t.getType(), t.getPrice(), t.getStatus(),
                    t.getPurchaseDate(), t.getUser().getEmail(), t.getEvent().getEventCode(), t.getEvent().getName());
        });

        TicketResponse result = ticketService.markAsUsed("TCK-003");

        assertThat(result.status()).isEqualTo(TicketStatus.USED);
        verify(ticketRepository).save(ticket);
    }

    @Test
    void markAsUsed_ticketCancelled_lanzaBusinessRuleException() {
        Ticket ticket = new Ticket("TCK-004", TicketType.GENERAL, new BigDecimal("100000.00"),
                TicketStatus.CANCELLED, LocalDateTime.now(fixedClock), activeAdultUser, event);
        when(ticketRepository.findByTicketCode("TCK-004")).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> ticketService.markAsUsed("TCK-004"))
                .isInstanceOf(BusinessRuleException.class);
        verify(ticketRepository, never()).save(any());
    }
}
