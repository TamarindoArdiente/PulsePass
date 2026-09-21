package com.pulsepass;
import com.pulsepass.domain.Artist;
import com.pulsepass.domain.Event;
import com.pulsepass.domain.EventCategory;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.domain.Ticket;
import com.pulsepass.domain.TicketStatus;
import com.pulsepass.domain.TicketType;
import com.pulsepass.domain.User;
import com.pulsepass.domain.UserProfile;
import com.pulsepass.domain.Venue;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.TicketRepository;
import com.pulsepass.repository.UserProfileRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.repository.VenueRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@Testcontainers
@SpringBootTest
@Transactional
class PulsePassIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:18-alpine")
                    .withDatabaseName("pulsepass_test")
                    .withUsername("pulsepass")
                    .withPassword("pulsepass");

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    

    @Test
    void flyway_ejecutoLasMigracionesV1V2V3() {
        List<String> versions = jdbcTemplate.queryForList(
                "select version from flyway_schema_history where success = true order by installed_rank",
                String.class);

        assertThat(versions).contains("1", "2", "3");
    }

    
    @Test
    void metodosHeredados_saveFindExistsCount() {
        Venue venue = new Venue("VEN-BASIC-01", "Test Arena", "Santa Marta",
                "Cra 1 # 2-3", 1000);

        Venue saved = venueRepository.save(venue);
        assertThat(saved.getId()).isNotNull();

        Optional<Venue> found = venueRepository.findById(saved.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getCode()).isEqualTo("VEN-BASIC-01");

        assertThat(venueRepository.existsById(saved.getId())).isTrue();
        assertThat(venueRepository.count()).isGreaterThanOrEqualTo(1);
    }

    
    @Test
    void relacion1N_venueConVariosEventos() {
        Venue venue = venueRepository.save(
                new Venue("VEN-1N-01", "1N Arena", "Santa Marta", "Calle 1", 500));

        Event event1 = new Event("EVT-1N-001", "Event One", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 10, 1, 20, 0), 0);
        Event event2 = new Event("EVT-1N-002", "Event Two", EventCategory.MUSIC,
                EventStatus.DRAFT, LocalDateTime.of(2026, 10, 5, 20, 0), 0);

        venue.addEvent(event1);
        venue.addEvent(event2);
        eventRepository.saveAll(List.of(event1, event2));

        List<Event> events = eventRepository.findByVenueCode("VEN-1N-01");

        assertThat(events).hasSize(2);
        assertThat(events).allSatisfy(e -> assertThat(e.getVenue().getCode()).isEqualTo("VEN-1N-01"));
    }

    

    @Test
    void relacion1a1_userYUserProfile() {
        User user = new User("juanp", "juanp@pulsepass.io");
        UserProfile profile = new UserProfile("Juan", "Perez");
        user.assignProfile(profile);

        userRepository.save(user);

        User persisted = userRepository.findByUsername("juanp").orElseThrow();

        assertThat(persisted.getUserProfile()).isNotNull();
        assertThat(persisted.getUserProfile().getFirstName()).isEqualTo("Juan");
        assertThat(persisted.getUserProfile().getUser().getUsername()).isEqualTo("juanp");
    }

   
    @Test
    void constraint_unique_segundoPerfilParaElMismoUsuarioEsRechazado() {
        User user = new User("mariaz", "mariaz@pulsepass.io");
        UserProfile firstProfile = new UserProfile("Maria", "Zapata");
        user.assignProfile(firstProfile);
        userRepository.saveAndFlush(user);

        UserProfile secondProfile = new UserProfile("Maria", "Zapata (dup)");
        secondProfile.setUser(user);

        assertThrows(DataIntegrityViolationException.class,
                () -> userProfileRepository.saveAndFlush(secondProfile));
    }

    

    @Test
    void relacionNaM_eventoConVariosArtistas() {
        Venue venue = venueRepository.save(
                new Venue("VEN-NM-01", "NM Arena", "Santa Marta", "Calle 2", 800));

        Event event = new Event("EVT-NM-001", "NM Fest", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 11, 1, 20, 0), 0);
        venue.addEvent(event);

        Artist solarBeat = artistRepository.findByStageName("Solar Beat").orElseThrow();
        Artist neonWaves = artistRepository.findByStageName("Neon Waves").orElseThrow();
        Artist caribbeanSound = artistRepository.findByStageName("Caribbean Sound").orElseThrow();

        event.addArtist(solarBeat);
        event.addArtist(neonWaves);
        event.addArtist(caribbeanSound);

        eventRepository.save(event);

        Event persisted = eventRepository.findByEventCode("EVT-NM-001").orElseThrow();
        assertThat(persisted.getArtists()).hasSize(3);
    }

   

    @Test
    void constraint_eventArtists_noSeDuplicaElMismoPar() {
        Venue venue = venueRepository.save(
                new Venue("VEN-DUP-01", "Dup Arena", "Santa Marta", "Calle 3", 800));

        Event event = new Event("EVT-DUP-001", "Dup Fest", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 11, 2, 20, 0), 0);
        venue.addEvent(event);

        Artist solarBeat = artistRepository.findByStageName("Solar Beat").orElseThrow();

      
        event.addArtist(solarBeat);
        event.addArtist(solarBeat);

        eventRepository.saveAndFlush(event);

        Event persisted = eventRepository.findByEventCode("EVT-DUP-001").orElseThrow();
        assertThat(persisted.getArtists()).hasSize(1);
    }

   

    @Test
    void relaciones_ticketApuntaAUsuarioYEvento() {
        Venue venue = venueRepository.save(
                new Venue("VEN-TKT-01", "Ticket Arena", "Santa Marta", "Calle 4", 800));
        Event event = new Event("EVT-TKT-001", "Ticket Fest", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 11, 3, 20, 0), 0);
        venue.addEvent(event);
        eventRepository.save(event);

        User user = userRepository.save(new User("ticketuser", "ticketuser@pulsepass.io"));

        Ticket ticket = new Ticket("TCK-REL-001", TicketType.GENERAL, new BigDecimal("120000.00"),
                TicketStatus.PAID, LocalDateTime.of(2026, 9, 1, 10, 0), user, event);
        ticketRepository.save(ticket);

        Ticket persisted = ticketRepository.findByTicketCode("TCK-REL-001").orElseThrow();

        assertThat(persisted.getUser().getUsername()).isEqualTo("ticketuser");
        assertThat(persisted.getEvent().getEventCode()).isEqualTo("EVT-TKT-001");
    }

   
    @Test
    void queryMethod_eventosPublicadosOrdenadosPorFecha() {
        Venue venue = venueRepository.save(
                new Venue("VEN-PUB-01", "Pub Arena", "Santa Marta", "Calle 5", 800));

        Event draft = new Event("EVT-PUB-000", "Draft Event", EventCategory.MUSIC,
                EventStatus.DRAFT, LocalDateTime.of(2026, 12, 1, 20, 0), 0);
        Event published1 = new Event("EVT-PUB-001", "Published Later", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 12, 15, 20, 0), 0);
        Event published2 = new Event("EVT-PUB-002", "Published Earlier", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 12, 5, 20, 0), 0);

        venue.addEvent(draft);
        venue.addEvent(published1);
        venue.addEvent(published2);
        eventRepository.saveAll(List.of(draft, published1, published2));

        List<Event> published = eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED)
                .stream()
                .filter(e -> e.getEventCode().startsWith("EVT-PUB"))
                .toList();

        assertThat(published)
                .extracting(Event::getEventCode)
                .containsExactly("EVT-PUB-002", "EVT-PUB-001");
    }

   
    @Test
    void jpql_eventosPorArtistaSinDuplicados() {
        Venue venue = venueRepository.save(
                new Venue("VEN-ART-01", "Art Arena", "Santa Marta", "Calle 6", 800));

        Artist solarBeat = artistRepository.findByStageName("Solar Beat").orElseThrow();
        Artist neonWaves = artistRepository.findByStageName("Neon Waves").orElseThrow();

        Event eventA = new Event("EVT-ART-001", "Solar A", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 10, 10, 20, 0), 0);
        Event eventB = new Event("EVT-ART-002", "Solar B", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 10, 20, 20, 0), 0);
        Event eventC = new Event("EVT-ART-003", "Only Neon", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 10, 25, 20, 0), 0);

        venue.addEvent(eventA);
        venue.addEvent(eventB);
        venue.addEvent(eventC);

        eventA.addArtist(solarBeat);
        eventA.addArtist(neonWaves);
        eventB.addArtist(solarBeat);
        eventC.addArtist(neonWaves);

        eventRepository.saveAll(List.of(eventA, eventB, eventC));

        List<Event> solarBeatEvents = eventRepository.findByArtistStageName("Solar Beat")
                .stream()
                .filter(e -> e.getEventCode().startsWith("EVT-ART"))
                .toList();

        // AC-007: cada evento relacionado aparece una sola vez, aunque comparta más de un artista
        assertThat(solarBeatEvents)
                .extracting(Event::getEventCode)
                .containsExactly("EVT-ART-001", "EVT-ART-002");
    }

  
    @Test
    void jpql_eventosPorCiudadYArtista() {
        Venue santaMarta = venueRepository.save(
                new Venue("VEN-CTY-01", "Santa Marta Arena", "Santa Marta", "Calle 7", 800));
        Venue bogota = venueRepository.save(
                new Venue("VEN-CTY-02", "Bogota Arena", "Bogota", "Calle 8", 800));

        Artist caribbeanSound = artistRepository.findByStageName("Caribbean Sound").orElseThrow();

        Event eventSantaMarta = new Event("EVT-CTY-001", "SM Fest",  EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 10, 12, 20, 0), 0);
        Event eventBogota = new Event("EVT-CTY-002", "Bogota Fest", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 10, 13, 20, 0), 0);

        santaMarta.addEvent(eventSantaMarta);
        bogota.addEvent(eventBogota);

        eventSantaMarta.addArtist(caribbeanSound);
        eventBogota.addArtist(caribbeanSound);

        eventRepository.saveAll(List.of(eventSantaMarta, eventBogota));

        List<Event> result = eventRepository.findByVenueCityAndArtistStageName("Santa Marta", "Caribbean Sound")
                .stream()
                .filter(e -> e.getEventCode().startsWith("EVT-CTY"))
                .toList();

        assertThat(result)
                .extracting(Event::getEventCode)
                .containsExactly("EVT-CTY-001");
    }

  
    @Test
    void jpql_eventosRecomendados() {
        Venue venue = venueRepository.save(
                new Venue("VEN-REC-01", "Rec Arena", "Santa Marta", "Calle 9", 800));

        Artist oceanDrive = artistRepository.findByStageName("Ocean Drive").orElseThrow();

        // Cumple: publicado, posterior a la fecha, misma ciudad, nombre de artista coincide (case-insensitive)
        Event match = new Event("EVT-REC-001", "Ocean Night", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 12, 1, 20, 0), 0);
        // No cumple: no está publicado
        Event notPublished = new Event("EVT-REC-002", "Ocean Draft", EventCategory.MUSIC,
                EventStatus.DRAFT, LocalDateTime.of(2026, 12, 2, 20, 0), 0);
        // No cumple: es anterior a la fecha de corte
        Event tooEarly = new Event("EVT-REC-003", "Ocean Early", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 1, 1, 20, 0), 0);

        venue.addEvent(match);
        venue.addEvent(notPublished);
        venue.addEvent(tooEarly);

        match.addArtist(oceanDrive);
        notPublished.addArtist(oceanDrive);
        tooEarly.addArtist(oceanDrive);

        eventRepository.saveAll(List.of(match, notPublished, tooEarly));

        List<Event> recommended = eventRepository.findRecommended(
                        LocalDateTime.of(2026, 6, 1, 0, 0),
                        "Santa Marta",
                        "ocean")
                .stream()
                .filter(e -> e.getEventCode().startsWith("EVT-REC"))
                .toList();

        assertThat(recommended)
                .extracting(Event::getEventCode)
                .containsExactly("EVT-REC-001");
    }

   

    @Test
    void queryMethod_ticketsPorUsuarioYEstado() {
        Venue venue = venueRepository.save(
                new Venue("VEN-USR-01", "User Arena", "Santa Marta", "Calle 10", 800));
        Event event = new Event("EVT-USR-001", "User Fest", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 10, 30, 20, 0), 0);
        venue.addEvent(event);
        eventRepository.save(event);

        User user = userRepository.save(new User("ana", "ana@pulsepass.io"));

        Ticket paid = new Ticket("TCK-USR-001", TicketType.GENERAL, new BigDecimal("100000.00"),
                TicketStatus.PAID, LocalDateTime.of(2026, 9, 1, 10, 0), user, event);
        Ticket reserved = new Ticket("TCK-USR-002", TicketType.VIP, new BigDecimal("200000.00"),
                TicketStatus.RESERVED, LocalDateTime.of(2026, 9, 2, 10, 0), user, event);
        ticketRepository.saveAll(List.of(paid, reserved));

        List<Ticket> allTickets = ticketRepository.findByUserEmail("ana@pulsepass.io");
        List<Ticket> paidTickets = ticketRepository.findByUserEmailAndStatus("ana@pulsepass.io", TicketStatus.PAID);

        assertThat(allTickets).hasSize(2);
        assertThat(paidTickets)
                .extracting(Ticket::getTicketCode)
                .containsExactly("TCK-USR-001");
    }

   

    @Test
    void queryMethod_ticketsPagadosPorEvento() {
        Venue venue = venueRepository.save(
                new Venue("VEN-PAID-01", "Paid Arena", "Santa Marta", "Calle 11", 800));
        Event event = new Event("EVT-PAID-001", "Paid Fest", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 10, 31, 20, 0), 0);
        venue.addEvent(event);
        eventRepository.save(event);

        User buyer1 = userRepository.save(new User("buyer1", "buyer1@pulsepass.io"));
        User buyer2 = userRepository.save(new User("buyer2", "buyer2@pulsepass.io"));

        Ticket paid1 = new Ticket("TCK-PAID-001", TicketType.GENERAL, new BigDecimal("100000.00"),
                TicketStatus.PAID, LocalDateTime.of(2026, 9, 1, 10, 0), buyer1, event);
        Ticket paid2 = new Ticket("TCK-PAID-002", TicketType.VIP, new BigDecimal("200000.00"),
                TicketStatus.PAID, LocalDateTime.of(2026, 9, 2, 10, 0), buyer2, event);
        Ticket cancelled = new Ticket("TCK-PAID-003", TicketType.GENERAL, new BigDecimal("100000.00"),
                TicketStatus.CANCELLED, LocalDateTime.of(2026, 9, 3, 10, 0), buyer1, event);

        ticketRepository.saveAll(List.of(paid1, paid2, cancelled));

        List<Ticket> paidTickets = ticketRepository.findByEventCodeAndStatus("EVT-PAID-001", TicketStatus.PAID);

        assertThat(paidTickets)
                .extracting(Ticket::getTicketCode)
                .containsExactlyInAnyOrder("TCK-PAID-001", "TCK-PAID-002");
    }



    @Test
    void jpql_conteoDeTicketsPagadosPorEvento() {
        Venue venue = venueRepository.save(
                new Venue("VEN-CNT-01", "Count Arena", "Santa Marta", "Calle 12", 800));
        Event event = new Event("EVT-CNT-001", "Count Fest", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 11, 15, 20, 0), 0);
        venue.addEvent(event);
        eventRepository.save(event);

        User andrea = userRepository.save(new User("andrea", "andrea@pulsepass.io"));
        User carlos = userRepository.save(new User("carlos", "carlos@pulsepass.io"));
        User laura = userRepository.save(new User("laura", "laura@pulsepass.io"));
        User miguel = userRepository.save(new User("miguel", "miguel@pulsepass.io"));

        ticketRepository.saveAll(List.of(
                new Ticket("TCK-CNT-001", TicketType.VIP, new BigDecimal("250000.00"),
                        TicketStatus.PAID, LocalDateTime.of(2026, 9, 1, 10, 0), andrea, event),
                new Ticket("TCK-CNT-002", TicketType.GENERAL, new BigDecimal("120000.00"),
                        TicketStatus.PAID, LocalDateTime.of(2026, 9, 2, 10, 0), carlos, event),
                new Ticket("TCK-CNT-003", TicketType.GENERAL, new BigDecimal("120000.00"),
                        TicketStatus.RESERVED, LocalDateTime.of(2026, 9, 3, 10, 0), laura, event),
                new Ticket("TCK-CNT-004", TicketType.VIP, new BigDecimal("250000.00"),
                        TicketStatus.CANCELLED, LocalDateTime.of(2026, 9, 4, 10, 0), miguel, event)
        ));

        long paidCount = ticketRepository.countPaidTicketsByEventCode("EVT-CNT-001");

        // AC-008: solo los PAID participan del conteo (2 de 4)
        assertThat(paidCount).isEqualTo(2L);
    }

    @Test
    void jpql_ticketsDeEventosFuturos() {
        Venue venue = venueRepository.save(
                new Venue("VEN-FUT-01", "Future Arena", "Santa Marta", "Calle 13", 800));

        Event pastEvent = new Event("EVT-FUT-000", "Past Event",EventCategory.MUSIC,
                EventStatus.FINISHED, LocalDateTime.of(2026, 1, 1, 20, 0), 0);
        Event futureEvent1 = new Event("EVT-FUT-001", "Future Event Later", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 12, 20, 20, 0), 0);
        Event futureEvent2 = new Event("EVT-FUT-002", "Future Event Earlier", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 12, 10, 20, 0), 0);

        venue.addEvent(pastEvent);
        venue.addEvent(futureEvent1);
        venue.addEvent(futureEvent2);
        eventRepository.saveAll(List.of(pastEvent, futureEvent1, futureEvent2));

        User user = userRepository.save(new User("futureuser", "futureuser@pulsepass.io"));

        ticketRepository.saveAll(List.of(
                new Ticket("TCK-FUT-000", TicketType.GENERAL, new BigDecimal("100000.00"),
                        TicketStatus.USED, LocalDateTime.of(2025, 12, 1, 10, 0), user, pastEvent),
                new Ticket("TCK-FUT-001", TicketType.GENERAL, new BigDecimal("100000.00"),
                        TicketStatus.PAID, LocalDateTime.of(2026, 9, 1, 10, 0), user, futureEvent1),
                new Ticket("TCK-FUT-002", TicketType.VIP, new BigDecimal("200000.00"),
                        TicketStatus.PAID, LocalDateTime.of(2026, 9, 2, 10, 0), user, futureEvent2)
        ));

        List<Ticket> futureTickets = ticketRepository.findByEventDateAfter(LocalDateTime.of(2026, 6, 1, 0, 0))
                .stream()
                .filter(t -> t.getTicketCode().startsWith("TCK-FUT"))
                .toList();

        assertThat(futureTickets)
                .extracting(Ticket::getTicketCode)
                .containsExactly("TCK-FUT-002", "TCK-FUT-001");
    }

   

    @Test
    void constraint_unique_venueCodeDuplicado() {
        venueRepository.saveAndFlush(
                new Venue("VEN-DUP-CODE", "First Arena", "Santa Marta", "Calle 14", 800));

        Venue duplicate = new Venue("VEN-DUP-CODE", "Second Arena", "Santa Marta", "Calle 15", 500);

        assertThrows(DataIntegrityViolationException.class,
                () -> venueRepository.saveAndFlush(duplicate));
    }

    

    @Test
    void constraint_check_capacidadDebeSerMayorQueCero() {
        Venue invalidVenue = new Venue("VEN-BAD-CAP", "Bad Arena", "Santa Marta", "Calle 16", 0);

        assertThrows(DataIntegrityViolationException.class,
                () -> venueRepository.saveAndFlush(invalidVenue));
    }

    

    @Test
    void constraint_check_precioNoPuedeSerNegativo() {
        Venue venue = venueRepository.save(
                new Venue("VEN-BAD-PRICE", "Bad Price Arena", "Santa Marta", "Calle 17", 500));
        Event event = new Event("EVT-BAD-PRICE-001", "Bad Price Fest", EventCategory.MUSIC,
                EventStatus.PUBLISHED, LocalDateTime.of(2026, 10, 1, 20, 0), 0);
        venue.addEvent(event);
        eventRepository.save(event);

        User user = userRepository.save(new User("badpriceuser", "badpriceuser@pulsepass.io"));

        Ticket invalidTicket = new Ticket("TCK-BAD-PRICE-001", TicketType.GENERAL, new BigDecimal("-1.00"),
                TicketStatus.RESERVED, LocalDateTime.now(), user, event);

        assertThrows(DataIntegrityViolationException.class,
                () -> ticketRepository.saveAndFlush(invalidTicket));
    }

    

    @Test
    void escenarioCompleto_referenciaPRD() {
        
        Venue venue = venueRepository.save(
                new Venue("VEN-SMR-01", "Marina Convention Center", "Santa Marta",
                        "Carrera 1 # 22-58", 5000));

       
        Event cmf2026 = new Event("CMF-2026", "Caribbean Music Fest 2026",
                EventCategory.MUSIC, EventStatus.PUBLISHED,
                LocalDateTime.of(2026, 12, 12, 19, 0), 0);
        venue.addEvent(cmf2026);

        Artist solarBeat = artistRepository.findByStageName("Solar Beat").orElseThrow();
        Artist neonWaves = artistRepository.findByStageName("Neon Waves").orElseThrow();
        Artist caribbeanSound = artistRepository.findByStageName("Caribbean Sound").orElseThrow();

        cmf2026.addArtist(solarBeat);
        cmf2026.addArtist(neonWaves);
        cmf2026.addArtist(caribbeanSound);

        eventRepository.save(cmf2026);

       
        User andrea = userRepository.save(new User("andrea.ref", "andrea.ref@pulsepass.io"));
        User carlos = userRepository.save(new User("carlos.ref", "carlos.ref@pulsepass.io"));
        User laura = userRepository.save(new User("laura.ref", "laura.ref@pulsepass.io"));
        User miguel = userRepository.save(new User("miguel.ref", "miguel.ref@pulsepass.io"));

        ticketRepository.saveAll(List.of(
                new Ticket("TCK-REF-0001", TicketType.VIP, new BigDecimal("250000.00"),
                        TicketStatus.PAID, LocalDateTime.of(2026, 10, 1, 9, 0), andrea, cmf2026),
                new Ticket("TCK-REF-0002", TicketType.GENERAL, new BigDecimal("120000.00"),
                        TicketStatus.PAID, LocalDateTime.of(2026, 10, 1, 9, 5), carlos, cmf2026),
                new Ticket("TCK-REF-0003", TicketType.GENERAL, new BigDecimal("120000.00"),
                        TicketStatus.RESERVED, LocalDateTime.of(2026, 10, 1, 9, 10), laura, cmf2026),
                new Ticket("TCK-REF-0004", TicketType.VIP, new BigDecimal("250000.00"),
                        TicketStatus.CANCELLED, LocalDateTime.of(2026, 10, 1, 9, 15), miguel, cmf2026)
        ));

        // AC-001: recuperar venue por código, capacidad > 0
        Venue persistedVenue = venueRepository.findByCode("VEN-SMR-01").orElseThrow();
        assertThat(persistedVenue.getCapacity()).isGreaterThan(0);

        // AC-002: recuperar evento por eventCode junto con su venue
        Event persistedEvent = eventRepository.findByEventCode("CMF-2026").orElseThrow();
        assertThat(persistedEvent.getVenue().getCode()).isEqualTo("VEN-SMR-01");

        // AC-003: los tres artistas quedan relacionados
        assertThat(persistedEvent.getArtists()).hasSize(3);

        // FR-EVT-005: el evento aparece entre los publicados
        assertThat(eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED))
                .extracting(Event::getEventCode)
                .contains("CMF-2026");

        // FR-ART-004 / AC-007: eventos por artista, sin duplicados
        assertThat(eventRepository.findByArtistStageName("Solar Beat"))
                .extracting(Event::getEventCode)
                .contains("CMF-2026");

        // AC-008: de los 4 tickets, solo Andrea y Carlos están PAID
        assertThat(ticketRepository.countPaidTicketsByEventCode("CMF-2026")).isEqualTo(2L);

        List<Ticket> paidTickets = ticketRepository.findByEventCodeAndStatus("CMF-2026", TicketStatus.PAID);
        assertThat(paidTickets)
                .extracting(t -> t.getUser().getUsername())
                .containsExactlyInAnyOrder("andrea.ref", "carlos.ref");
    }
}
