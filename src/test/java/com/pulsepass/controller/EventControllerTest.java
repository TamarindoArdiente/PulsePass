package com.pulsepass.controller;

import com.pulsepass.domain.EventCategory;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.domain.TicketStatus;
import com.pulsepass.domain.TicketType;
import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.ArtistResponse;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.dto.response.EventSummaryResponse;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.service.EventService;
import com.pulsepass.service.TicketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EventController.class)
@AutoConfigureMockMvc(addFilters = false) // las reglas de seguridad se prueban en SecurityRulesTest
class EventControllerTest {

    private static final String VALID_BODY = """
            {
              "eventCode": "CMF-2026",
              "name": "Caribbean Music Fest 2026",
              "description": "Festival de música",
              "category": "MUSIC",
              "eventDate": "2030-12-01T20:00:00",
              "minimumAge": 18,
              "venueCode": "VEN-SMR-01"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EventService eventService;

    @MockitoBean
    private TicketService ticketService;

    private EventResponse event(EventStatus status, List<ArtistResponse> artists) {
        return new EventResponse(1L, "CMF-2026", "Caribbean Music Fest 2026", "Festival de música",
                EventCategory.MUSIC, status, LocalDateTime.of(2030, 12, 1, 20, 0), 18,
                "VEN-SMR-01", "Marina Convention Center", artists);
    }

    private EventSummaryResponse summary() {
        return new EventSummaryResponse(1L, "CMF-2026", "Caribbean Music Fest 2026",
                EventCategory.MUSIC, EventStatus.PUBLISHED, LocalDateTime.of(2030, 12, 1, 20, 0),
                "Marina Convention Center");
    }

    @Test
    void TEST_CTRL_EVT_001_createValid_returns201() throws Exception {
        when(eventService.create(any(CreateEventRequest.class)))
                .thenReturn(event(EventStatus.DRAFT, List.of()));

        mockMvc.perform(post("/api/events").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.venueCode").value("VEN-SMR-01"));

        verify(eventService).create(any(CreateEventRequest.class));
    }

    @Test
    void TEST_CTRL_EVT_002_invalidRequest_returns400WithDetailsAndDoesNotCallService() throws Exception {
        String invalid = """
                {
                  "eventCode": "",
                  "name": "Fest",
                  "category": "MUSIC",
                  "eventDate": "2030-12-01T20:00:00",
                  "minimumAge": -1,
                  "venueCode": ""
                }
                """;

        mockMvc.perform(post("/api/events").contentType(MediaType.APPLICATION_JSON).content(invalid))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.details.eventCode").value("Event code is required"))
                .andExpect(jsonPath("$.details.venueCode").value("Venue code is required"))
                .andExpect(jsonPath("$.details.minimumAge").exists());

        verify(eventService, never()).create(any());
    }

    @Test
    void TEST_CTRL_EVT_002b_missingCategoryAndDate_returns400() throws Exception {
        String invalid = """
                { "eventCode": "X-1", "name": "Fest", "minimumAge": 0, "venueCode": "V-1" }
                """;

        mockMvc.perform(post("/api/events").contentType(MediaType.APPLICATION_JSON).content(invalid))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.category").exists())
                .andExpect(jsonPath("$.details.eventDate").exists());

        verify(eventService, never()).create(any());
    }

    @Test
    void TEST_CTRL_EVT_002c_unknownCategoryValue_returns400() throws Exception {
        String invalid = VALID_BODY.replace("MUSIC", "NOT_A_CATEGORY");

        mockMvc.perform(post("/api/events").contentType(MediaType.APPLICATION_JSON).content(invalid))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        verify(eventService, never()).create(any());
    }

    @Test
    void TEST_CTRL_EVT_002d_duplicateEventCode_returns409() throws Exception {
        when(eventService.create(any(CreateEventRequest.class)))
                .thenThrow(new DuplicateResourceException("Event already exists: CMF-2026"));

        mockMvc.perform(post("/api/events").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Event already exists: CMF-2026"));
    }

    @Test
    void TEST_CTRL_EVT_003_findExisting_returns200() throws Exception {
        when(eventService.findByCode("CMF-2026")).thenReturn(event(EventStatus.DRAFT, List.of()));

        mockMvc.perform(get("/api/events/CMF-2026"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$.name").value("Caribbean Music Fest 2026"));

        verify(eventService).findByCode("CMF-2026");
    }

    @Test
    void TEST_CTRL_EVT_004_unknownEvent_returns404() throws Exception {
        when(eventService.findByCode("NOPE"))
                .thenThrow(new ResourceNotFoundException("Event not found: NOPE"));

        mockMvc.perform(get("/api/events/NOPE"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Event not found: NOPE"));
    }

    @Test
    void TEST_CTRL_EVT_005_listPublished_returns200() throws Exception {
        when(eventService.findPublishedEvents()).thenReturn(List.of(summary()));

        mockMvc.perform(get("/api/events/published"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].eventCode").value("CMF-2026"))
                .andExpect(jsonPath("$[0].status").value("PUBLISHED"));

        verify(eventService).findPublishedEvents();
    }

    @Test
    void TEST_CTRL_EVT_006_publishValid_returns200() throws Exception {
        when(eventService.publish("CMF-2026")).thenReturn(event(EventStatus.PUBLISHED, List.of()));

        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        verify(eventService).publish("CMF-2026");
    }

    @Test
    void TEST_CTRL_EVT_007_publishInvalid_returns409() throws Exception {
        when(eventService.publish("CMF-2026"))
                .thenThrow(new BusinessRuleException("Only DRAFT events can be published"));

        mockMvc.perform(patch("/api/events/CMF-2026/publish"))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Only DRAFT events can be published"));
    }

    @Test
    void TEST_CTRL_EVT_008_addArtist_returns200() throws Exception {
        ArtistResponse artist = new ArtistResponse(1L, "Solar Beat", "Colombia", "Electronic", true);
        when(eventService.addArtist("CMF-2026", 1L)).thenReturn(event(EventStatus.DRAFT, List.of(artist)));

        mockMvc.perform(post("/api/events/CMF-2026/artists/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.artists.length()").value(1))
                .andExpect(jsonPath("$.artists[0].stageName").value("Solar Beat"));

        verify(eventService).addArtist("CMF-2026", 1L);
    }

    @Test
    void TEST_CTRL_EVT_008b_addArtistConflict_returns409() throws Exception {
        when(eventService.addArtist("CMF-2026", 1L))
                .thenThrow(new BusinessRuleException("Artist already associated with event"));

        mockMvc.perform(post("/api/events/CMF-2026/artists/1"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void TEST_CTRL_EVT_008c_addUnknownArtist_returns404() throws Exception {
        when(eventService.addArtist("CMF-2026", 99L))
                .thenThrow(new ResourceNotFoundException("Artist not found: 99"));

        mockMvc.perform(post("/api/events/CMF-2026/artists/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Artist not found: 99"));
    }

    @Test
    void TEST_CTRL_EVT_009_findByArtist_returns200() throws Exception {
        when(eventService.findByArtist("Solar Beat")).thenReturn(List.of(summary()));

        mockMvc.perform(get("/api/events/by-artist").param("stageName", "Solar Beat"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].eventCode").value("CMF-2026"));

        verify(eventService).findByArtist("Solar Beat");
    }

    @Test
    void TEST_CTRL_EVT_009b_findByArtistWithoutParam_returns400() throws Exception {
        mockMvc.perform(get("/api/events/by-artist"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.stageName").exists());

        verify(eventService, never()).findByArtist(any());
    }

    @Test
    void TEST_CTRL_EVT_010_paidTicketsByEvent_returns200() throws Exception {
        TicketResponse ticket = new TicketResponse(1L, "TKT-001", TicketType.GENERAL, new BigDecimal("100.00"),
                TicketStatus.PAID, LocalDateTime.of(2026, 10, 1, 10, 0), "andrea@example.com",
                "CMF-2026", "Caribbean Music Fest 2026");
        when(ticketService.findPaidTicketsByEvent("CMF-2026")).thenReturn(List.of(ticket));

        mockMvc.perform(get("/api/events/CMF-2026/tickets/paid"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("PAID"));

        verify(ticketService).findPaidTicketsByEvent("CMF-2026");
    }
}
