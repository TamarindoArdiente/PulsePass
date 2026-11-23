package com.pulsepass.auth;

import java.util.List;

/**
 * Respuesta de GET /api/auth/me. Los roles se devuelven sin prefijo (USER, STAFF, ADMIN).
 * {@code identifier} es el identificador de inicio de sesión (el username).
 */
public record AuthenticatedUserResponse(
        Long id,
        String identifier,
        String username,
        String email,
        List<String> roles
) {
}
