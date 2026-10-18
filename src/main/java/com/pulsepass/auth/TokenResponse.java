package com.pulsepass.auth;

public record TokenResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {
}
