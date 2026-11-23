package com.pulsepass.service;

import com.pulsepass.domain.TicketType;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TicketPricingPolicyTest {

    private final TicketPricingPolicy policy = new TicketPricingPolicy();

    @Test
    void calculatePrice_general_retornaPrecioBase() {
        assertThat(policy.calculatePrice(TicketType.GENERAL)).isEqualByComparingTo("100000.00");
    }

    @Test
    void calculatePrice_student_aplicaDescuento() {
        BigDecimal studentPrice = policy.calculatePrice(TicketType.STUDENT);
        BigDecimal generalPrice = policy.calculatePrice(TicketType.GENERAL);
        assertThat(studentPrice).isLessThan(generalPrice);
    }

    @Test
    void calculatePrice_vip_aplicaMultiplicador() {
        BigDecimal vipPrice = policy.calculatePrice(TicketType.VIP);
        BigDecimal generalPrice = policy.calculatePrice(TicketType.GENERAL);
        assertThat(vipPrice).isGreaterThan(generalPrice);
    }

    @Test
    void calculatePrice_backstage_esElMasCaro() {
        BigDecimal backstagePrice = policy.calculatePrice(TicketType.BACKSTAGE);
        BigDecimal vipPrice = policy.calculatePrice(TicketType.VIP);
        assertThat(backstagePrice).isGreaterThan(vipPrice);
    }

    @Test
    void calculatePrice_ningunPrecioEsNegativo() {
        for (TicketType type : TicketType.values()) {
            assertThat(policy.calculatePrice(type)).isGreaterThanOrEqualTo(BigDecimal.ZERO);
        }
    }

    @Test
    void calculatePrice_tipoNulo_lanzaIllegalArgumentException() {
        assertThatThrownBy(() -> policy.calculatePrice(null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
