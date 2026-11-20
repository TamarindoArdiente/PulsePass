package com.pulsepass.security;

import com.pulsepass.domain.User;
import com.pulsepass.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Carga el usuario desde la base de datos. El identificador recibido puede ser el username o el email
 * (el login del frontend acepta ambos). El JWT siempre lleva el username real como subject.
 */
@Service
public class JpaUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public JpaUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmailIgnoreCase(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));

        // Usuarios anteriores a la fase de seguridad no tienen credenciales: no pueden autenticarse.
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new UsernameNotFoundException("User has no credentials: " + identifier);
        }

        return new AppUserDetails(user.getId(), user.getUsername(), user.getEmail(), user.getPassword(),
                user.isActive(), user.getRole().name());
    }
}
