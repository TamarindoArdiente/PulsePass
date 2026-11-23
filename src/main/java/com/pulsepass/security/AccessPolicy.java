package com.pulsepass.security;

import java.util.Optional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Reglas de propiedad y de rol que no se pueden expresar solo con URLs.
 * Se usa desde los controladores y desde @PreAuthorize (bean "accessPolicy").
 * La autoridad es siempre el servidor: el frontend solo oculta botones.
 */
@Component("accessPolicy")
public class AccessPolicy {

    public Optional<AppUserDetails> currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AppUserDetails user) {
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        String expected = "ROLE_" + role;
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (expected.equals(authority.getAuthority())) {
                return true;
            }
        }
        return false;
    }

    /** STAFF o ADMIN: personal que puede ver borradores y tickets ajenos. */
    public boolean isOperator() {
        return hasRole("STAFF") || hasRole("ADMIN");
    }

    public boolean isOwnEmail(String email) {
        return email != null && currentUser().map(u -> email.equalsIgnoreCase(u.getEmail())).orElse(false);
    }

    public boolean isOwnUsername(String username) {
        return username != null && currentUser().map(u -> username.equals(u.getUsername())).orElse(false);
    }

    /** El email debe ser el del usuario autenticado. */
    public void requireOwnEmail(String email) {
        if (!isOwnEmail(email)) {
            throw new AccessDeniedException("Access denied");
        }
    }

    /** El recurso debe ser del usuario autenticado o la persona debe ser STAFF/ADMIN. */
    public void requireOwnerOrOperator(String ownerEmail) {
        if (!isOperator() && !isOwnEmail(ownerEmail)) {
            throw new AccessDeniedException("Access denied");
        }
    }
}
