package com.pulsepass.service;

import com.pulsepass.domain.TicketType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class TicketPricingPolicy {

    private static final BigDecimal BASE_PRICE = new BigDecimal("100000.00");
    private static final BigDecimal STUDENT_FACTOR = new BigDecimal("0.50");
    private static final BigDecimal VIP_FACTOR = new BigDecimal("2.00");
    private static final BigDecimal BACKSTAGE_FACTOR = new BigDecimal("3.50");

    public BigDecimal calculatePrice(TicketType type) {
        if (type == null) {
            throw new IllegalArgumentException("Ticket type must not be null");
        }

        BigDecimal factor = switch (type) {
            case GENERAL -> BigDecimal.ONE;
            case STUDENT -> STUDENT_FACTOR;
            case VIP -> VIP_FACTOR;
            case BACKSTAGE -> BACKSTAGE_FACTOR;
        };

        return BASE_PRICE.multiply(factor).setScale(2, RoundingMode.HALF_UP);
    }
}
