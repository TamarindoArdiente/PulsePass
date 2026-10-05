package com.pulsepass.service;

import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class TicketCodeGenerator {

    public String generate(String eventCode) {
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "TCK-" + eventCode + "-" + suffix;
    }
}
