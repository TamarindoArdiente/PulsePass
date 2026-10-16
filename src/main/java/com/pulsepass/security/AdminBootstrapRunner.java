package com.pulsepass.security;

import com.pulsepass.domain.User;
import com.pulsepass.domain.UserProfile;
import com.pulsepass.domain.UserRole;
import com.pulsepass.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;


@Component
@ConditionalOnProperty(name = "security.bootstrap-admin.enabled", havingValue = "true")
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String email;
    private final String password;

    public AdminBootstrapRunner(UserRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                @Value("${security.bootstrap-admin.username:}") String username,
                                @Value("${security.bootstrap-admin.email:}") String email,
                                @Value("${security.bootstrap-admin.password:}") String password) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (isBlank(username) || isBlank(email) || isBlank(password)) {
            throw new IllegalStateException(
                    "BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are required "
                            + "when BOOTSTRAP_ADMIN_ENABLED=true");
        }

        if (userRepository.existsByUsername(username)) {
            log.info("Bootstrap admin '{}' already exists; skipping", username);
            return;
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalStateException("Bootstrap admin email is already used by another user");
        }

        User admin = new User(username, email);
        admin.setRole(UserRole.ADMIN);
        admin.setPassword(passwordEncoder.encode(password));
        admin.assignProfile(new UserProfile("Admin", "PulsePass"));
        userRepository.save(admin);

        log.info("Bootstrap admin '{}' created", username);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
