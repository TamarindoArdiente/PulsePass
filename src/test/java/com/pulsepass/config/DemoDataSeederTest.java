package com.pulsepass.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.domain.User;
import com.pulsepass.domain.UserRole;
import com.pulsepass.domain.Venue;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.repository.VenueRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.Period;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class DemoDataSeederTest {

    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-11-19T12:00:00Z"), ZoneId.of("UTC"));

    @Mock
    private UserRepository userRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private DemoDataSeeder seeder;

    @BeforeEach
    void setUp() {
        seeder = new DemoDataSeeder(userRepository, venueRepository, eventRepository, passwordEncoder,
                CLOCK, "PulsePass-Dev-2026!");
    }

    @Test
    void createsOneUserPerRole_withEncodedPassword() {
        when(venueRepository.findByCode("VEN-SMR-01")).thenReturn(Optional.empty());
        when(venueRepository.save(any(Venue.class))).thenAnswer(inv -> inv.getArgument(0));
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(false);
        when(passwordEncoder.encode("PulsePass-Dev-2026!")).thenReturn("{bcrypt}hash");

        seeder.run(null);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, org.mockito.Mockito.times(6)).save(captor.capture());
        List<User> users = captor.getAllValues();

        assertThat(users).extracting(User::getRole).contains(UserRole.ADMIN, UserRole.STAFF, UserRole.USER);
        assertThat(users).allSatisfy(u -> assertThat(u.getPassword()).isEqualTo("{bcrypt}hash"));
        assertThat(users).filteredOn(u -> u.getUsername().equals("miguel")).singleElement()
                .satisfies(u -> assertThat(u.isActive()).isFalse());
        assertThat(users).filteredOn(User::isActive).hasSize(5);
    }

    @Test
    void lauraIsUnderageOnTheEventDate() {
        when(venueRepository.findByCode("VEN-SMR-01")).thenReturn(Optional.empty());
        when(venueRepository.save(any(Venue.class))).thenAnswer(inv -> inv.getArgument(0));
        when(passwordEncoder.encode(any())).thenReturn("{bcrypt}hash");

        seeder.run(null);

        ArgumentCaptor<Event> eventCaptor = ArgumentCaptor.forClass(Event.class);
        verify(eventRepository).save(eventCaptor.capture());
        Event event = eventCaptor.getValue();
        assertThat(event.getEventCode()).isEqualTo("CMF-2026");
        assertThat(event.getStatus()).isEqualTo(EventStatus.DRAFT);
        assertThat(event.getMinimumAge()).isEqualTo(18);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, org.mockito.Mockito.atLeastOnce()).save(userCaptor.capture());
        User laura = userCaptor.getAllValues().stream()
                .filter(u -> u.getUsername().equals("laura")).findFirst().orElseThrow();
        int age = Period.between(laura.getUserProfile().getBirthDate(), event.getEventDate().toLocalDate()).getYears();
        assertThat(age).isEqualTo(17);
    }

    @Test
    void isIdempotent_existingUsersAndEventAreSkipped() {
        when(venueRepository.findByCode("VEN-SMR-01"))
                .thenReturn(Optional.of(new Venue("VEN-SMR-01", "Marina", "Santa Marta", "x", 3)));
        when(eventRepository.existsByEventCode("CMF-2026")).thenReturn(true);
        when(userRepository.existsByUsername(any())).thenReturn(true);

        seeder.run(null);

        verify(userRepository, never()).save(any());
        verify(eventRepository, never()).save(any());
        verify(venueRepository, never()).save(any());
    }

    @Test
    void shortPassword_isRejected() {
        DemoDataSeeder weak = new DemoDataSeeder(userRepository, venueRepository, eventRepository, passwordEncoder,
                CLOCK, "corta");

        assertThatThrownBy(() -> weak.run(null)).isInstanceOf(IllegalStateException.class);
        verify(userRepository, never()).save(any());
    }
}
