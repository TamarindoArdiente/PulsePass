package com.pulsepass.config;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.EventCategory;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.domain.User;
import com.pulsepass.domain.UserProfile;
import com.pulsepass.domain.UserRole;
import com.pulsepass.domain.Venue;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.repository.VenueRepository;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Datos de demostración para desarrollar y probar el frontend (escenario de los PRD, sección 22).
 * Solo se ejecuta con {@code app.seed.enabled=true} (perfil dev). Es idempotente: lo que ya existe se omite.
 *
 * <pre>
 * username  rol    notas
 * admin     ADMIN  crea/publica eventos y asocia artistas
 * staff     STAFF  valida ingresos y consulta tickets pagados
 * andrea    USER   adulta, activa
 * carlos    USER   adulto, activo
 * laura     USER   17 años: la compra del evento 18+ se rechaza
 * miguel    USER   inactivo: el login se rechaza
 * </pre>
 * Todos usan la contraseña {@code app.seed.password}. También crea la sede VEN-SMR-01 (capacidad 3) y el
 * evento CMF-2026 en borrador (mayores de 18), para que ADMIN lo asocie a artistas y lo publique.
 */
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;
    private final String password;

    public DemoDataSeeder(UserRepository userRepository,
                          VenueRepository venueRepository,
                          EventRepository eventRepository,
                          PasswordEncoder passwordEncoder,
                          Clock clock,
                          @Value("${app.seed.password:}") String password) {
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.eventRepository = eventRepository;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
        this.password = password;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (password == null || password.length() < 12) {
            throw new IllegalStateException(
                    "app.seed.password is required (at least 12 characters) when app.seed.enabled=true");
        }

        LocalDateTime eventDate = LocalDateTime.now(clock).plusDays(90).withHour(20).withMinute(0)
                .withSecond(0).withNano(0);

        seedVenueAndEvent(eventDate);

        LocalDate today = LocalDate.now(clock);
        seedUser("admin", "admin@pulsepass.test", UserRole.ADMIN, true, "Admin", "PulsePass", LocalDate.of(1990, 1, 1));
        seedUser("staff", "staff@pulsepass.test", UserRole.STAFF, true, "Staff", "PulsePass", LocalDate.of(1992, 2, 2));
        seedUser("andrea", "andrea@pulsepass.test", UserRole.USER, true, "Andrea", "Gomez", LocalDate.of(1995, 5, 10));
        seedUser("carlos", "carlos@pulsepass.test", UserRole.USER, true, "Carlos", "Perez", LocalDate.of(1992, 8, 21));
        // 17 años en la fecha del evento: no cumple la edad mínima (18).
        seedUser("laura", "laura@pulsepass.test", UserRole.USER, true, "Laura", "Diaz",
                eventDate.toLocalDate().minusYears(17).minusMonths(6));
        seedUser("miguel", "miguel@pulsepass.test", UserRole.USER, false, "Miguel", "Rojas", LocalDate.of(1990, 3, 14));

        log.info("Demo data ready ({}). Users: admin (ADMIN), staff (STAFF), andrea/carlos/laura (USER), "
                + "miguel (USER, inactive).", today);
    }

    private void seedVenueAndEvent(LocalDateTime eventDate) {
        Venue venue = venueRepository.findByCode("VEN-SMR-01").orElseGet(() -> venueRepository.save(
                new Venue("VEN-SMR-01", "Marina Convention Center", "Santa Marta", "Av. del Libertador 123", 3)));

        if (!eventRepository.existsByEventCode("CMF-2026")) {
            Event event = new Event("CMF-2026", "Caribbean Music Fest 2026", EventCategory.MUSIC,
                    EventStatus.DRAFT, eventDate, 18);
            event.setDescription("Festival de musica del Caribe (evento de demostracion).");
            venue.addEvent(event);
            eventRepository.save(event);
        }
    }

    private void seedUser(String username, String email, UserRole role, boolean active,
                          String firstName, String lastName, LocalDate birthDate) {
        if (userRepository.existsByUsername(username) || userRepository.existsByEmailIgnoreCase(email)) {
            return;
        }

        User user = new User(username, email);
        user.setRole(role);
        user.setActive(active);
        user.setPassword(passwordEncoder.encode(password));

        UserProfile profile = new UserProfile(firstName, lastName);
        profile.setBirthDate(birthDate);
        profile.setCity("Santa Marta");
        user.assignProfile(profile);

        userRepository.save(user);
    }
}
