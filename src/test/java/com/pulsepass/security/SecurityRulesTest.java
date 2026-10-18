package com.pulsepass.security;

import com.pulsepass.auth.AuthenticationService;
import com.pulsepass.config.SecurityConfig;
import com.pulsepass.domain.EventCategory;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.domain.TicketStatus;
import com.pulsepass.domain.TicketType;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.dto.response.UserResponse;
import com.pulsepass.service.ArtistService;
import com.pulsepass.service.EventService;
import com.pulsepass.service.TicketService;
import com.pulsepass.service.UserService;
import com.pulsepass.service.VenueService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@WebMvcTest
@Import({SecurityConfig.class, JwtService.class, AuthenticationService.class})
class SecurityRulesTest {

    private static final String EVENT_BODY = """
            {
              "eventCode": "CMF-2026",
              "name": "Caribbean Music Fest 2026",
              "description": "Festival",
              "category": "MUSIC",
              "eventDate": "2030-12-01T20:00:00",
              "minimumAge": 18,
              "venueCode": "VEN-SMR-01"
            }
            """;

    private static final String REGISTER_BODY = """
            {
              "username": "andrea",
              "email": "andrea@example.com",
              "password": "Str0ng-Passw0rd",
              "firstName": "Andrea",
              "lastName": "Gomez",
              "birthDate": "1995-05-10"
            }
            """;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private VenueService venueService;

    @MockitoBean
    private ArtistService artistService;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private TicketService ticketService;

    @MockitoBean
    private UserService userService;

    private MockMvc mockMvc;

    private UserDetails student;
    private UserDetails organizer;
    private UserDetails admin;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();

        student = userDetails("student", "student123", "USER", true);
        organizer = userDetails("organizer", "organizer123", "ORGANIZER", true);
        admin = userDetails("admin", "admin123", "ADMIN", true);

        when(userDetailsService.loadUserByUsername("student")).thenReturn(student);
        when(userDetailsService.loadUserByUsername("organizer")).thenReturn(organizer);
        when(userDetailsService.loadUserByUsername("admin")).thenReturn(admin);
    }

    private UserDetails userDetails(String username, String rawPassword, String role, boolean enabled) {
        return User.withUsername(username)
                .password(passwordEncoder.encode(rawPassword))
                .roles(role)
                .disabled(!enabled)
                .build();
    }

    private String bearer(UserDetails user) {
        return "Bearer " + jwtService.generateToken(user);
    }

    private UserResponse userResponse(String username) {
        return new UserResponse(1L, username, username + "@example.com", true,
                "First", "Last", null, null, LocalDate.of(1995, 5, 10));
    }

    private EventResponse eventResponse() {
        return new EventResponse(1L, "CMF-2026", "Caribbean Music Fest 2026", "Festival",
                EventCategory.MUSIC, EventStatus.DRAFT, LocalDateTime.of(2030, 12, 1, 20, 0), 18,
                "VEN-SMR-01", "Marina Convention Center", List.of());
    }

    private TicketResponse ticketResponse(TicketStatus status) {
        return new TicketResponse(1L, "TKT-001", TicketType.GENERAL, new BigDecimal("100.00"), status,
                LocalDateTime.of(2026, 10, 1, 10, 0), "andrea@example.com", "CMF-2026", "Caribbean Music Fest 2026");
    }

    //  login

    @Test
    void login_correct_returnsJwt() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"student\",\"password\":\"student123\"}"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value((int) jwtProperties.expiration().toSeconds()));
    }

    @Test
    void login_wrongPassword_returns401WithErrorResponse() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"student\",\"password\":\"wrong-password\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid username or password"))
                .andExpect(jsonPath("$.accessToken").doesNotExist());
    }

    @Test
    void login_unknownUser_returns401() throws Exception {
        when(userDetailsService.loadUserByUsername("ghost")).thenThrow(new UsernameNotFoundException("ghost"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"ghost\",\"password\":\"whatever123\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void login_disabledUser_returns401() throws Exception {
        UserDetails disabled = userDetails("miguel", "miguel123", "USER", false);
        when(userDetailsService.loadUserByUsername("miguel")).thenReturn(disabled);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"miguel\",\"password\":\"miguel123\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_blankFields_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.username").exists())
                .andExpect(jsonPath("$.details.password").exists());

        verifyNoInteractions(userDetailsService);
    }

    //  public vs protected

    @Test
    void publicEndpoint_withoutToken_returns200() throws Exception {
        when(venueService.findActiveVenues()).thenReturn(List.of());

        mockMvc.perform(get("/api/venues/active"))
                .andExpect(status().isOk());
    }

    @Test
    void publicEndpoint_withInvalidToken_stillReturns200() throws Exception {
        when(eventService.findPublishedEvents()).thenReturn(List.of());

        mockMvc.perform(get("/api/events/published").header("Authorization", "Bearer garbage"))
                .andExpect(status().isOk());
    }

    @Test
    void register_isPublic_returns201() throws Exception {
        when(userService.register(any())).thenReturn(userResponse("andrea"));

        mockMvc.perform(post("/api/users").contentType(MediaType.APPLICATION_JSON).content(REGISTER_BODY))
                .andExpect(status().isCreated());
    }

    @Test
    void protectedEndpoint_withoutToken_returns401WithErrorResponse() throws Exception {
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.timestamp").exists());

        verifyNoInteractions(userService);
    }

    @Test
    void protectedEndpoint_withValidToken_returns200() throws Exception {
        when(userService.findByUsername("student")).thenReturn(userResponse("student"));

        mockMvc.perform(get("/api/profile").header("Authorization", bearer(student)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("student"));

        verify(userService).findByUsername("student");
    }

    @Test
    void protectedEndpoint_withExpiredToken_returns401() throws Exception {
        JwtService expiredIssuer = new JwtService(
                new JwtProperties(jwtProperties.secret(), Duration.ofSeconds(-30), jwtProperties.issuer()));
        String expired = expiredIssuer.generateToken(student);

        mockMvc.perform(get("/api/profile").header("Authorization", "Bearer " + expired))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void protectedEndpoint_withTamperedToken_returns401() throws Exception {
        String[] parts = jwtService.generateToken(student).split("\\.");
        String payload = new String(Base64.getUrlDecoder().decode(parts[1]))
                .replace("student", "admin").replace("USER", "ADMIN");
        String forged = parts[0] + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes())
                + "." + parts[2];

        mockMvc.perform(get("/api/profile").header("Authorization", "Bearer " + forged))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpoint_withMalformedToken_returns401() throws Exception {
        mockMvc.perform(get("/api/profile").header("Authorization", "Bearer abc"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpoint_withNonBearerHeader_returns401() throws Exception {
        mockMvc.perform(get("/api/profile").header("Authorization", "Basic c3R1ZGVudDpzdHVkZW50MTIz"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void token_ofDisabledUser_returns401() throws Exception {
        UserDetails nowDisabled = userDetails("student", "student123", "USER", false);
        String token = jwtService.generateToken(student);
        when(userDetailsService.loadUserByUsername("student")).thenReturn(nowDisabled);

        mockMvc.perform(get("/api/profile").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void token_ofDeletedUser_returns401() throws Exception {
        String token = jwtService.generateToken(student);
        when(userDetailsService.loadUserByUsername("student")).thenThrow(new UsernameNotFoundException("student"));

        mockMvc.perform(get("/api/profile").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    //  roles (403)

    @Test
    void user_cannotCreateEvent_returns403() throws Exception {
        mockMvc.perform(post("/api/events")
                        .header("Authorization", bearer(student))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(EVENT_BODY))
                .andExpect(status().isForbidden())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"));

        verifyNoInteractions(eventService);
    }

    @Test
    void organizer_canCreateEvent_returns201() throws Exception {
        when(eventService.create(any())).thenReturn(eventResponse());

        mockMvc.perform(post("/api/events")
                        .header("Authorization", bearer(organizer))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(EVENT_BODY))
                .andExpect(status().isCreated());
    }

    @Test
    void admin_canCreateEvent_returns201() throws Exception {
        when(eventService.create(any())).thenReturn(eventResponse());

        mockMvc.perform(post("/api/events")
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(EVENT_BODY))
                .andExpect(status().isCreated());
    }

    @Test
    void createEvent_withoutToken_returns401() throws Exception {
        mockMvc.perform(post("/api/events").contentType(MediaType.APPLICATION_JSON).content(EVENT_BODY))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(eventService);
    }

    @Test
    void user_cannotPublishEvent_returns403_organizerCan() throws Exception {
        when(eventService.publish("CMF-2026")).thenReturn(eventResponse());

        mockMvc.perform(patch("/api/events/CMF-2026/publish").header("Authorization", bearer(student)))
                .andExpect(status().isForbidden());
        verify(eventService, never()).publish(any());

        mockMvc.perform(patch("/api/events/CMF-2026/publish").header("Authorization", bearer(organizer)))
                .andExpect(status().isOk());
    }

    @Test
    void user_cannotAddArtist_returns403() throws Exception {
        mockMvc.perform(post("/api/events/CMF-2026/artists/1").header("Authorization", bearer(student)))
                .andExpect(status().isForbidden());

        verifyNoInteractions(eventService);
    }

    @Test
    void paidTicketsByEvent_isAdminOnly() throws Exception {
        when(ticketService.findPaidTicketsByEvent("CMF-2026")).thenReturn(List.of(ticketResponse(TicketStatus.PAID)));

        mockMvc.perform(get("/api/events/CMF-2026/tickets/paid").header("Authorization", bearer(student)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/events/CMF-2026/tickets/paid").header("Authorization", bearer(organizer)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/events/CMF-2026/tickets/paid").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PAID"));
    }

    @Test
    void markTicketAsUsed_requiresOrganizerOrAdmin() throws Exception {
        when(ticketService.markAsUsed("TKT-001")).thenReturn(ticketResponse(TicketStatus.USED));

        mockMvc.perform(patch("/api/tickets/TKT-001/use").header("Authorization", bearer(student)))
                .andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/tickets/TKT-001/use").header("Authorization", bearer(organizer)))
                .andExpect(status().isOk());
    }

    @Test
    void ticketPurchaseAndCancel_requireAuthentication_butAnyRole() throws Exception {
        when(ticketService.purchase(any())).thenReturn(ticketResponse(TicketStatus.PAID));
        when(ticketService.cancel("TKT-001")).thenReturn(ticketResponse(TicketStatus.CANCELLED));
        String purchase = "{\"userEmail\":\"andrea@example.com\",\"eventCode\":\"CMF-2026\",\"type\":\"GENERAL\"}";

        mockMvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(purchase))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/tickets").header("Authorization", bearer(student))
                        .contentType(MediaType.APPLICATION_JSON).content(purchase))
                .andExpect(status().isCreated());
        mockMvc.perform(patch("/api/tickets/TKT-001/cancel").header("Authorization", bearer(student)))
                .andExpect(status().isOk());
    }

    @Test
    void userLookupByEmail_isAdminOnly() throws Exception {
        when(userService.findByEmail("andrea@example.com")).thenReturn(userResponse("andrea"));

        mockMvc.perform(get("/api/users/by-email").param("email", "andrea@example.com")
                        .header("Authorization", bearer(student)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/users/by-email").param("email", "andrea@example.com")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }

    //  method security (@PreAuthorize)

    @Test
    void userLookupByUsername_ownerAllowed_otherUserForbidden_adminAllowed() throws Exception {
        when(userService.findByUsername("student")).thenReturn(userResponse("student"));
        when(userService.findByUsername("andrea")).thenReturn(userResponse("andrea"));

        mockMvc.perform(get("/api/users/by-username").param("username", "student")
                        .header("Authorization", bearer(student)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/users/by-username").param("username", "andrea")
                        .header("Authorization", bearer(student)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Access denied"));
        verify(userService, never()).findByUsername("andrea");

        mockMvc.perform(get("/api/users/by-username").param("username", "andrea")
                        .header("Authorization", bearer(admin)))
                .andExpect(status().isOk());
    }
}
