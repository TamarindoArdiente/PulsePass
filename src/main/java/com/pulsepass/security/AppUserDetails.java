package com.pulsepass.security;

import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Principal de la aplicación: además de las credenciales lleva el id y el email del usuario,
 * necesarios para comprobar la propiedad de los recursos (anti-IDOR) y para GET /api/auth/me.
 */
public class AppUserDetails implements UserDetails {

    private final Long id;
    private final String username;
    private final String email;
    private final String password;
    private final boolean enabled;
    private final List<GrantedAuthority> authorities;

    public AppUserDetails(Long id, String username, String email, String password, boolean enabled, String role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.enabled = enabled;
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public String toString() {
        return "AppUserDetails[username=" + username + ", authorities=" + authorities + "]";
    }
}
