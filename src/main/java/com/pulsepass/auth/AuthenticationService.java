package com.pulsepass.auth;

import com.pulsepass.security.JwtProperties;
import com.pulsepass.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties properties;

    public AuthenticationService(AuthenticationManager authenticationManager,
                                 JwtService jwtService,
                                 JwtProperties properties) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.properties = properties;
    }


    public TokenResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(userDetails);

        return new TokenResponse(token, "Bearer", properties.expiration().toSeconds());
    }
}
