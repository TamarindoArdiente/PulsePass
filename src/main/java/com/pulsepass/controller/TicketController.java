package com.pulsepass.controller;

import com.pulsepass.dto.request.PurchaseTicketRequest;
import com.pulsepass.dto.response.TicketResponse;
import com.pulsepass.security.AccessPolicy;
import com.pulsepass.service.TicketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final AccessPolicy accessPolicy;

    public TicketController(TicketService ticketService, AccessPolicy accessPolicy) {
        this.ticketService = ticketService;
        this.accessPolicy = accessPolicy;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> purchase(@Valid @RequestBody PurchaseTicketRequest request) {
        // Anti-IDOR: solo se compra a nombre del usuario autenticado (el email del cuerpo no es la autoridad).
        accessPolicy.requireOwnEmail(request.userEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.purchase(request));
    }

    @GetMapping("/{ticketCode}")
    public ResponseEntity<TicketResponse> findByCode(@PathVariable String ticketCode) {
        TicketResponse ticket = ticketService.findByCode(ticketCode);
        accessPolicy.requireOwnerOrOperator(ticket.userEmail());
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/by-user")
    public ResponseEntity<List<TicketResponse>> findByUserEmail(
            @RequestParam @NotBlank(message = "Email is required") String email) {
        if (!accessPolicy.hasRole("ADMIN")) {
            accessPolicy.requireOwnEmail(email);
        }
        return ResponseEntity.ok(ticketService.findByUserEmail(email));
    }

    @PatchMapping("/{ticketCode}/cancel")
    public ResponseEntity<TicketResponse> cancel(@PathVariable String ticketCode) {
        // Solo la persona propietaria cancela su ticket (404 si no existe, 403 si es ajeno).
        accessPolicy.requireOwnEmail(ticketService.findByCode(ticketCode).userEmail());
        return ResponseEntity.ok(ticketService.cancel(ticketCode));
    }

    @PatchMapping("/{ticketCode}/use")
    public ResponseEntity<TicketResponse> markAsUsed(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ticketService.markAsUsed(ticketCode));
    }
}
