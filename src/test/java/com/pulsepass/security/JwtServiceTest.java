package com.pulsepass.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    // Claves exclusivas de prueba (Base64 de 32 bytes).
    private static final String SECRET = "SCQhV2EDobK0OFFfOL4q5liNgaLqzKwfPWfvuCwvqDc=";
    private static final String OTHER_SECRET = "ngw+l6/GsZ5sr2mQ1Di3lGGb+6luadyDkR1GoUJyRyg=";
    private static final String ISSUER = "pulsepass-api";

    private final JwtService jwtService =
            new JwtService(new JwtProperties(SECRET, Duration.ofMinutes(15), ISSUER));

    private final UserDetails student = User.withUsername("student")
            .password("{noop}ignored").roles("USER").build();

    @Test
    void shouldGenerateAndReadToken() {
        String token = jwtService.generateToken(student);

        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
        assertThat(jwtService.extractUsername(token)).isEqualTo("student");
        assertThat(jwtService.isTokenValid(token, student)).isTrue();
    }

    @Test
    void payloadContainsIssuerAndRolesButNoPassword() {
        String token = jwtService.generateToken(student);

        String payload = new String(Base64.getUrlDecoder().decode(token.split("\\.")[1]), StandardCharsets.UTF_8);

        assertThat(payload).contains("\"iss\":\"pulsepass-api\"");
        assertThat(payload).contains("\"sub\":\"student\"");
        assertThat(payload).contains("\"roles\":[\"USER\"]");
        assertThat(payload).doesNotContain("password").doesNotContain("ignored");
    }

    @Test
    void rolesClaimContainsEveryRoleWithoutPrefix() {
        UserDetails admin = User.withUsername("admin").password("{noop}x").roles("USER", "ADMIN").build();

        String token = jwtService.generateToken(admin);
        String payload = new String(Base64.getUrlDecoder().decode(token.split("\\.")[1]), StandardCharsets.UTF_8);

        // El orden de las authorities no está garantizado: se comprueba la presencia, no la posición.
        assertThat(payload).contains("\"USER\"").contains("\"ADMIN\"").doesNotContain("ROLE_");
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService expiredIssuer = new JwtService(new JwtProperties(SECRET, Duration.ofSeconds(-30), ISSUER));
        String token = expiredIssuer.generateToken(student);

        assertThatThrownBy(() -> jwtService.extractUsername(token)).isInstanceOf(JwtException.class);
        assertThatThrownBy(() -> jwtService.isTokenValid(token, student)).isInstanceOf(JwtException.class);
    }

    @Test
    void tokenSignedWithAnotherKeyIsRejected() {
        JwtService foreign = new JwtService(new JwtProperties(OTHER_SECRET, Duration.ofMinutes(15), ISSUER));
        String token = foreign.generateToken(student);

        assertThatThrownBy(() -> jwtService.extractUsername(token)).isInstanceOf(JwtException.class);
    }

    @Test
    void tokenWithDifferentIssuerIsRejected() {
        JwtService otherIssuer = new JwtService(new JwtProperties(SECRET, Duration.ofMinutes(15), "someone-else"));
        String token = otherIssuer.generateToken(student);

        assertThatThrownBy(() -> jwtService.extractUsername(token)).isInstanceOf(JwtException.class);
    }

    @Test
    void tokenWithTamperedPayloadIsRejected() {
        String token = jwtService.generateToken(student);
        String[] parts = token.split("\\.");
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8)
                .replace("\"USER\"", "\"ADMIN\"");
        String forged = parts[0] + "."
                + Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8))
                + "." + parts[2];

        assertThatThrownBy(() -> jwtService.extractUsername(forged)).isInstanceOf(JwtException.class);
    }

    @Test
    void malformedTokenIsRejected() {
        assertThatThrownBy(() -> jwtService.extractUsername("not-a-jwt")).isInstanceOf(JwtException.class);
    }

    @Test
    void tokenIsNotValidForAnotherSubject() {
        String token = jwtService.generateToken(student);
        UserDetails other = User.withUsername("other").password("{noop}x").roles("USER").build();

        assertThat(jwtService.isTokenValid(token, other)).isFalse();
    }

    @Test
    void weakSecretFailsFast() {
        String weak = Base64.getEncoder().encodeToString("too-short".getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> new JwtService(new JwtProperties(weak, Duration.ofMinutes(15), ISSUER)))
                .isInstanceOf(RuntimeException.class);
    }
}
