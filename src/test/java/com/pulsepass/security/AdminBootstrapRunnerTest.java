package com.pulsepass.security;

import com.pulsepass.domain.User;
import com.pulsepass.domain.UserRole;
import com.pulsepass.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapRunnerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AdminBootstrapRunner runner(String username, String email, String password) {
        return new AdminBootstrapRunner(userRepository, passwordEncoder, username, email, password);
    }

    @Test
    void createsAdminWithEncodedPassword() {
        when(userRepository.existsByUsername("admin")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("admin@pulsepass.io")).thenReturn(false);
        when(passwordEncoder.encode("S3cret-Admin")).thenReturn("{bcrypt}hash");

        runner("admin", "admin@pulsepass.io", "S3cret-Admin").run(null);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.getRole()).isEqualTo(UserRole.ADMIN);
        assertThat(saved.getPassword()).isEqualTo("{bcrypt}hash");
        assertThat(saved.isActive()).isTrue();
        assertThat(saved.getUserProfile()).isNotNull();
    }

    @Test
    void isIdempotentWhenAdminAlreadyExists() {
        when(userRepository.existsByUsername("admin")).thenReturn(true);

        runner("admin", "admin@pulsepass.io", "S3cret-Admin").run(null);

        verify(userRepository, never()).save(any());
    }

    @Test
    void failsFastWhenCredentialsAreMissing() {
        assertThatThrownBy(() -> runner("admin", "", "").run(null))
                .isInstanceOf(IllegalStateException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    void failsWhenEmailBelongsToAnotherUser() {
        when(userRepository.existsByUsername("admin")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("admin@pulsepass.io")).thenReturn(true);

        assertThatThrownBy(() -> runner("admin", "admin@pulsepass.io", "S3cret-Admin").run(null))
                .isInstanceOf(IllegalStateException.class);
        verify(userRepository, never()).save(any());
    }
}
