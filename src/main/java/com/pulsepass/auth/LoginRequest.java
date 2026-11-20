package com.pulsepass.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

/**
 * Credenciales de acceso. {@code identifier} es el username o el email.
 * Por compatibilidad también se acepta el nombre de campo anterior {@code username}.
 */
public record LoginRequest(
        @NotBlank(message = "Identifier is required")
        @JsonAlias("username")
        String identifier,

        @NotBlank(message = "Password is required")
        String password
) {

    @Override
    public String toString() {
        return "LoginRequest[identifier=" + identifier + ", password=***]";
    }
}
