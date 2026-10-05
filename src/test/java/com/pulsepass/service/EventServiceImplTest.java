package com.pulsepass.service;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.EventCategory;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.domain.Venue;
import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.EventMapper;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.VenueRepository;
import com.pulsepass.service.impl.EventServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private EventMapper eventMapper;

    private EventServiceImpl eventService;

    // "Ahora" fijo para que las reglas de fecha sean determinísticas
    private final Clock fixedClock =
            Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC);

    private Venue venue;

    @BeforeEach
    void setUp() {
        eventService = new EventServiceImpl(eventRepository, venueRepository, artistRepository, eventMapper, fixedClock);
        venue = new Venue("VEN-SMR-01", "Marina Convention Center", "Santa Marta", "Calle 1", 3);
    }

    private CreateEventRequest validRequest() {
        return new CreateEventRequest(
                "CMF-2026",
                "Caribbean Music Fest 2026",
                "Festival de música caribeña",
                EventCategory.MUSIC,
                LocalDateTime.now(fixedClock).plusMonths(6),
                18,
                "VEN-SMR-01"
        );
    }

    // TEST-EVENT-001: Evento existente -> retorna DTO
    @Test
    void findByCode_eventoExistente_retornaDto() {
        // ARRANGE
        Event event = new Event("CMF-2026", "Caribbean Music Fest 2026", EventCategory.MUSIC,
                EventStatus.DRAFT, LocalDateTime.now(fixedClock).plusMonths(6), 18);
        event.setVenue(venue);
        EventResponse expected = new EventResponse(1L, "CMF-2026", "Caribbean Music Fest 2026", null,
                EventCategory.MUSIC, EventStatus.DRAFT, event.getEventDate(), 18, "VEN-SMR-01",
                "Marina Convention Center", List.of());

        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(eventMapper.toResponse(event)).thenReturn(expected);

        // ACT
        EventResponse result = eventService.findByCode("CMF-2026");

        // ASSERT
        assertThat(result).isEqualTo(expected);
    }

    // TEST-EVENT-002: Evento inexistente -> ResourceNotFoundException
    @Test
    void findByCode_eventoInexistente_lanzaResourceNotFoundException() {
        // ARRANGE
        when(eventRepository.findByEventCode("DOES-NOT-EXIST")).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThatThrownBy(() -> eventService.findByCode("DOES-NOT-EXIST"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("DOES-NOT-EXIST");
    }

    // TEST-EVENT-003: Crear evento válido -> save() ejecutado
    @Test
    void create_eventoValido_ejecutaSave() {
        // ARRANGE
        CreateEventRequest request = validRequest();
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(venueRepository.findByCode("VEN-SMR-01")).thenReturn(Optional.of(venue));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(eventMapper.toResponse(any(Event.class))).thenReturn(
                new EventResponse(1L, "CMF-2026", "Caribbean Music Fest 2026", request.description(),
                        EventCategory.MUSIC, EventStatus.DRAFT, request.eventDate(), 18,
                        "VEN-SMR-01", "Marina Convention Center", List.of()));

        // ACT
        EventResponse result = eventService.create(request);

        // ASSERT
        assertThat(result.status()).isEqualTo(EventStatus.DRAFT);
        verify(eventRepository).save(any(Event.class));
    }

    // Código duplicado -> DuplicateResourceException y save() nunca ejecutado
    @Test
    void create_codigoDuplicado_lanzaDuplicateResourceExceptionYNoGuarda() {
        // ARRANGE
        CreateEventRequest request = validRequest();
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(true);

        // ACT & ASSERT
        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(DuplicateResourceException.class);
        verify(eventRepository, never()).save(any());
    }

    // TEST-EVENT-004: Venue inexistente -> error y save() nunca ejecutado
    @Test
    void create_venueInexistente_lanzaResourceNotFoundExceptionYNoGuarda() {
        // ARRANGE
        CreateEventRequest request = validRequest();
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(venueRepository.findByCode("VEN-SMR-01")).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(eventRepository, never()).save(any());
    }

    // TEST-EVENT-005: Venue inactivo -> BusinessRuleException
    @Test
    void create_venueInactivo_lanzaBusinessRuleException() {
        // ARRANGE
        venue.setActive(false);
        CreateEventRequest request = validRequest();
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(venueRepository.findByCode("VEN-SMR-01")).thenReturn(Optional.of(venue));

        // ACT & ASSERT
        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(BusinessRuleException.class);
        verify(eventRepository, never()).save(any());
    }

    // TEST-EVENT-006: Fecha pasada -> BusinessRuleException
    @Test
    void create_fechaPasada_lanzaBusinessRuleException() {
        // ARRANGE
        CreateEventRequest request = new CreateEventRequest(
                "CMF-2026", "Caribbean Music Fest 2026", "desc", EventCategory.MUSIC,
                LocalDateTime.now(fixedClock).minusDays(1), 18, "VEN-SMR-01");
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(venueRepository.findByCode("VEN-SMR-01")).thenReturn(Optional.of(venue));

        // ACT & ASSERT
        assertThatThrownBy(() -> eventService.create(request))
                .isInstanceOf(BusinessRuleException.class);
        verify(eventRepository, never()).save(any());
    }

    // TEST-EVENT-007: Publicar DRAFT válido -> PUBLISHED
    @Test
    void publish_draftValido_cambiaAPublished() {
        // ARRANGE
        Event event = new Event("CMF-2026", "Caribbean Music Fest 2026", EventCategory.MUSIC,
                EventStatus.DRAFT, LocalDateTime.now(fixedClock).plusMonths(6), 18);
        event.setVenue(venue);

        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(eventMapper.toResponse(any(Event.class))).thenAnswer(invocation -> {
            Event e = invocation.getArgument(0);
            return new EventResponse(1L, e.getEventCode(), e.getName(), e.getDescription(), e.getCategory(),
                    e.getStatus(), e.getEventDate(), e.getMinimumAge(), venue.getCode(), venue.getName(), List.of());
        });

        // ACT
        EventResponse result = eventService.publish("CMF-2026");

        // ASSERT
        assertThat(result.status()).isEqualTo(EventStatus.PUBLISHED);
        verify(eventRepository).save(event);
    }

    // TEST-EVENT-008: Publicar CANCELLED -> BusinessRuleException y no persistir
    @Test
    void publish_eventoCancelled_lanzaBusinessRuleExceptionYNoPersiste() {
        // ARRANGE
        Event event = new Event("CMF-2026", "Caribbean Music Fest 2026", EventCategory.MUSIC,
                EventStatus.CANCELLED, LocalDateTime.now(fixedClock).plusMonths(6), 18);
        event.setVenue(venue);
        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));

        // ACT & ASSERT
        assertThatThrownBy(() -> eventService.publish("CMF-2026"))
                .isInstanceOf(BusinessRuleException.class);
        verify(eventRepository, never()).save(any());
    }

    // BR-EVENT-010: no se puede asociar dos veces el mismo artista
    @Test
    void addArtist_artistaYaAsociado_lanzaBusinessRuleException() {
        // ARRANGE
        Event event = new Event("CMF-2026", "Caribbean Music Fest 2026", EventCategory.MUSIC,
                EventStatus.DRAFT, LocalDateTime.now(fixedClock).plusMonths(6), 18);
        event.setVenue(venue);
        com.pulsepass.domain.Artist artist = new com.pulsepass.domain.Artist("Solar Beat", "Colombia", "Electronic");
        event.addArtist(artist);

        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(artistRepository.findById(1L)).thenReturn(Optional.of(artist));

        // ACT & ASSERT
        assertThatThrownBy(() -> eventService.addArtist("CMF-2026", 1L))
                .isInstanceOf(BusinessRuleException.class);
        verify(eventRepository, never()).save(any());
    }

    // BR-EVENT-011: no se pueden agregar artistas a eventos FINISHED
    @Test
    void addArtist_eventoFinished_lanzaBusinessRuleException() {
        // ARRANGE
        Event event = new Event("CMF-2026", "Caribbean Music Fest 2026", EventCategory.MUSIC,
                EventStatus.FINISHED, LocalDateTime.now(fixedClock).minusDays(1), 18);
        event.setVenue(venue);
        com.pulsepass.domain.Artist artist = new com.pulsepass.domain.Artist("Solar Beat", "Colombia", "Electronic");

        when(eventRepository.findByEventCode("CMF-2026")).thenReturn(Optional.of(event));
        when(artistRepository.findById(1L)).thenReturn(Optional.of(artist));

        // ACT & ASSERT
        assertThatThrownBy(() -> eventService.addArtist("CMF-2026", 1L))
                .isInstanceOf(BusinessRuleException.class);
        verify(eventRepository, never()).save(any());
    }
}
