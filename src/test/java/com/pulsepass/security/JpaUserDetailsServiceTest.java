package com.pulsepass.security;

import com.pulsepass.domain.User;
import com.pulsepass.domain.UserRole;
import com.pulsepass.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JpaUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private JpaUserDetailsService service;

    private User user(String password, UserRole role, boolean active) {
        User user = new User("andrea", "andrea@example.com");
        user.setPassword(password);
        user.setRole(role);
        user.setActive(active);
        return user;
    }

    @Test
    void activeUserIsLoadedWithHashAndRole() {
        when(userRepository.findByUsername("andrea"))
                .thenReturn(Optional.of(user("{bcrypt}hash", UserRole.ORGANIZER, true)));

        UserDetails details = service.loadUserByUsername("andrea");

        assertThat(details.getUsername()).isEqualTo("andrea");
        assertThat(details.getPassword()).isEqualTo("{bcrypt}hash");
        assertThat(details.isEnabled()).isTrue();
        assertThat(details.getAuthorities()).extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_ORGANIZER");
    }

    @Test
    void inactiveUserIsDisabled() {
        when(userRepository.findByUsername("andrea"))
                .thenReturn(Optional.of(user("{bcrypt}hash", UserRole.USER, false)));

        assertThat(service.loadUserByUsername("andrea").isEnabled()).isFalse();
    }

    @Test
    void unknownUserThrowsUsernameNotFound() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.loadUserByUsername("ghost"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void legacyUserWithoutPasswordCannotAuthenticate() {
        when(userRepository.findByUsername("andrea"))
                .thenReturn(Optional.of(user(null, UserRole.USER, true)));

        assertThatThrownBy(() -> service.loadUserByUsername("andrea"))
                .isInstanceOf(UsernameNotFoundException.class);
    }
}
