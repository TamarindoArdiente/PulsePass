package com.pulsepass.controller;

import com.pulsepass.domain.TicketStatus;
import com.pulsepass.domain.TicketType;
import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.ResourceNotFoundException;
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

@WebMvcTest(TicketController.class)
@AutoConfigureMockMvc(addFilters = false) // las reglas de seguridad se prueban en SecurityRulesTest
class TicketControllerTest {

    private static final String VALID_BODY = """
            { "userEmail": "andrea@example.com", "eventCode": "CMF-2026", "type": "GENERAL" }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TicketService ticketService;

    private TicketResponse ticket(TicketStatus status) {
        return new TicketResponse(1L, "TKT-001", TicketType.GENERAL, new BigDecimal("100.00"), status,
                LocalDateTime.of(2026, 10, 1, 10, 0), "andrea@example.com",
                "CMF-2026", "Caribbean Music Fest 2026");
    }

    @Test
    void TEST_CTRL_TKT_001_validPurchase_returns201() throws Exception {
        when(ticketService.purchase(any(PurchaseTicketRequest.class))).thenReturn(ticket(TicketStatus.PAID));

        mockMvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.ticketCode").value("TKT-001"))
                .andExpect(jsonPath("$.status").value("PAID"))
                .andExpect(jsonPath("$.userEmail").value("andrea@example.com"))
                .andExpect(jsonPath("$.eventCode").value("CMF-2026"));

        verify(ticketService).purchase(any(PurchaseTicketRequest.class));
    }

    @Test
    void TEST_CTRL_TKT_002_invalidRequest_returns400AndDoesNotCallService() throws Exception {
        String invalid = """
                { "userEmail": "bad-email", "eventCode": "" }
                """;

        mockMvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(invalid))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.details.userEmail").exists())
                .andExpect(jsonPath("$.details.eventCode").exists())
                .andExpect(jsonPath("$.details.type").exists());

        verify(ticketService, never()).purchase(any());
    }

    @Test
    void TEST_CTRL_TKT_002b_unknownTicketType_returns400() throws Exception {
        String invalid = VALID_BODY.replace("GENERAL", "PLATINUM");

        mockMvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(invalid))
                .andExpect(status().isBadRequest());

        verify(ticketService, never()).purchase(any());
    }

    @Test
    void TEST_CTRL_TKT_003_unknownUser_returns404() throws Exception {
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenThrow(new ResourceNotFoundException("User not found: andrea@example.com"));

        mockMvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("User not found: andrea@example.com"));
    }

    @Test
    void TEST_CTRL_TKT_004_businessRuleViolation_returns409() throws Exception {
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenThrow(new BusinessRuleException("User does not meet minimum age for event: CMF-2026"));

        mockMvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("User does not meet minimum age for event: CMF-2026"));
    }

    @Test
    void TEST_CTRL_TKT_004b_unexpectedError_returns500WithoutInternalDetails() throws Exception {
        when(ticketService.purchase(any(PurchaseTicketRequest.class)))
                .thenThrow(new IllegalStateException("db password leaked"));

        mockMvc.perform(post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.error").value("Internal Server Error"))
                .andExpect(jsonPath("$.message").value("Unexpected internal error"));
    }

    @Test
    void TEST_CTRL_TKT_005_findByCode_returns200() throws Exception {
        when(ticketService.findByCode("TKT-001")).thenReturn(ticket(TicketStatus.PAID));

        mockMvc.perform(get("/api/tickets/TKT-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketCode").value("TKT-001"));

        verify(ticketService).findByCode("TKT-001");
    }

    @Test
    void TEST_CTRL_TKT_005b_unknownTicket_returns404() throws Exception {
        when(ticketService.findByCode("NOPE"))
                .thenThrow(new ResourceNotFoundException("Ticket not found: NOPE"));

        mockMvc.perform(get("/api/tickets/NOPE"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Ticket not found: NOPE"));
    }

    @Test
    void TEST_CTRL_TKT_006_ticketsByUser_returns200() throws Exception {
        when(ticketService.findByUserEmail("andrea@example.com")).thenReturn(List.of(ticket(TicketStatus.PAID)));

        mockMvc.perform(get("/api/tickets/by-user").param("email", "andrea@example.com"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].userEmail").value("andrea@example.com"));

        verify(ticketService).findByUserEmail("andrea@example.com");
    }

    @Test
    void TEST_CTRL_TKT_006b_ticketsByUserWithoutEmail_returns400() throws Exception {
        mockMvc.perform(get("/api/tickets/by-user"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details.email").exists());

        verify(ticketService, never()).findByUserEmail(any());
    }

    @Test
    void TEST_CTRL_TKT_008_validCancel_returns200() throws Exception {
        when(ticketService.cancel("TKT-001")).thenReturn(ticket(TicketStatus.CANCELLED));

        mockMvc.perform(patch("/api/tickets/TKT-001/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(ticketService).cancel("TKT-001");
    }

    @Test
    void TEST_CTRL_TKT_009_invalidCancel_returns409() throws Exception {
        when(ticketService.cancel("TKT-001"))
                .thenThrow(new BusinessRuleException("Only PAID tickets can be cancelled"));

        mockMvc.perform(patch("/api/tickets/TKT-001/cancel"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Only PAID tickets can be cancelled"));
    }

    @Test
    void TEST_CTRL_TKT_010_validUse_returns200() throws Exception {
        when(ticketService.markAsUsed("TKT-001")).thenReturn(ticket(TicketStatus.USED));

        mockMvc.perform(patch("/api/tickets/TKT-001/use"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("USED"));

        verify(ticketService).markAsUsed("TKT-001");
    }

    @Test
    void TEST_CTRL_TKT_011_invalidUse_returns409() throws Exception {
        when(ticketService.markAsUsed("TKT-001"))
                .thenThrow(new BusinessRuleException("Only PAID tickets can be marked as used"));

        mockMvc.perform(patch("/api/tickets/TKT-001/use"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Only PAID tickets can be marked as used"));
    }
}
