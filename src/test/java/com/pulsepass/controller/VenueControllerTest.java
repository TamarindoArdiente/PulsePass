package com.pulsepass.controller;

import com.pulsepass.dto.response.VenueResponse;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.service.VenueService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(VenueController.class)
@AutoConfigureMockMvc(addFilters = false) // las reglas de seguridad se prueban en SecurityRulesTest
class VenueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private VenueService venueService;

    private VenueResponse marina() {
        return new VenueResponse(1L, "VEN-SMR-01", "Marina Convention Center",
                "Santa Marta", "Calle 1 # 2-3", 3, true);
    }

    @Test
    void TEST_CTRL_VEN_001_existingVenue_returns200() throws Exception {
        when(venueService.findByCode("VEN-SMR-01")).thenReturn(marina());

        mockMvc.perform(get("/api/venues/VEN-SMR-01"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.code").value("VEN-SMR-01"))
                .andExpect(jsonPath("$.name").value("Marina Convention Center"))
                .andExpect(jsonPath("$.capacity").value(3))
                .andExpect(jsonPath("$.active").value(true));

        verify(venueService).findByCode("VEN-SMR-01");
    }

    @Test
    void TEST_CTRL_VEN_002_unknownVenue_returns404WithErrorResponse() throws Exception {
        when(venueService.findByCode("NOPE"))
                .thenThrow(new ResourceNotFoundException("Venue not found: NOPE"));

        mockMvc.perform(get("/api/venues/NOPE"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Venue not found: NOPE"))
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.details").isEmpty());
    }

    @Test
    void TEST_CTRL_VEN_003_activeVenues_returns200() throws Exception {
        when(venueService.findActiveVenues()).thenReturn(List.of(marina()));

        mockMvc.perform(get("/api/venues/active"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].code").value("VEN-SMR-01"));

        verify(venueService).findActiveVenues();
    }
}
