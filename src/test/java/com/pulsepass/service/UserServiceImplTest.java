package com.pulsepass.service;

import com.pulsepass.domain.User;
import com.pulsepass.dto.request.RegisterUserRequest;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.mapper.UserMapper;
import com.pulsepass.repository.UserRepository;
import com.pulsepass.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    private UserServiceImpl userService;

    private final Clock fixedClock =
            Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC);

    @BeforeEach
    void setUp() {
        userService = new UserServiceImpl(userRepository, userMapper, fixedClock);
    }

    private RegisterUserRequest validRequest() {
        return new RegisterUserRequest(
                "juanp", "juan.perez@email.com", "Juan", "Perez",
                "3001234567", "Santa Marta", LocalDate.of(2000, 5, 10));
    }

    @Test
    void register_usuarioValido_creaUserYUserProfileEnLaMismaTransaccion() {
        RegisterUserRequest request = validRequest();
        when(userRepository.existsByUsername("juanp")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("juan.perez@email.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userMapper.toResponse(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            return new UserResponse(1L, u.getUsername(), u.getEmail(), u.isActive(),
                    u.getUserProfile().getFirstName(), u.getUserProfile().getLastName(),
                    u.getUserProfile().getPhone(), u.getUserProfile().getCity(),
                    u.getUserProfile().getBirthDate());
        });

         
        UserResponse result = userService.register(request);

        assertThat(result.username()).isEqualTo("juanp");
        assertThat(result.active()).isTrue();
        assertThat(result.firstName()).isEqualTo("Juan");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User savedUser = captor.getValue();
        assertThat(savedUser.getUserProfile()).isNotNull();
        assertThat(savedUser.getUserProfile().getUser()).isEqualTo(savedUser);
    }

    @Test
    void register_usernameDuplicado_lanzaDuplicateResourceException() {
        RegisterUserRequest request = validRequest();
        when(userRepository.existsByUsername("juanp")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_emailDuplicado_lanzaDuplicateResourceException() {
        RegisterUserRequest request = validRequest();
        when(userRepository.existsByUsername("juanp")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("juan.perez@email.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(DuplicateResourceException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_birthDateFutura_lanzaBusinessRuleException() {
        RegisterUserRequest request = new RegisterUserRequest(
                "juanp", "juan.perez@email.com", "Juan", "Perez",
                "3001234567", "Santa Marta", LocalDate.now(fixedClock).plusDays(1));
        when(userRepository.existsByUsername("juanp")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("juan.perez@email.com")).thenReturn(false);

        assertThatThrownBy(() -> userService.register(request))
                .isInstanceOf(BusinessRuleException.class);
        verify(userRepository, never()).save(any());
    }
}
