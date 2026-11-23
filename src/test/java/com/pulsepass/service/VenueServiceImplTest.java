package com.pulsepass.service;

import com.pulsepass.domain.Venue;
import com.pulsepass.dto.response.VenueResponse;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.VenueMapper;
import com.pulsepass.repository.VenueRepository;
import com.pulsepass.service.impl.VenueServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VenueServiceImplTest {

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private VenueMapper venueMapper;

    private VenueServiceImpl venueService;

    @BeforeEach
    void setUp() {
        venueService = new VenueServiceImpl(venueRepository, venueMapper);
    }

    @Test
    void findByCode_venueExistente_retornaDto() {
        Venue venue = new Venue("VEN-SMR-01", "Marina Convention Center", "Santa Marta", "Calle 1", 3);
        VenueResponse expected = new VenueResponse(1L, "VEN-SMR-01", "Marina Convention Center",
                "Santa Marta", "Calle 1", 3, true);
        when(venueRepository.findByCode("VEN-SMR-01")).thenReturn(Optional.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(expected);

        VenueResponse result = venueService.findByCode("VEN-SMR-01");

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void findByCode_venueInexistente_lanzaResourceNotFoundException() {
        when(venueRepository.findByCode("DOES-NOT-EXIST")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> venueService.findByCode("DOES-NOT-EXIST"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void findActiveVenues_retornaSoloVenuesActivos() {
        Venue activeVenue = new Venue("VEN-SMR-01", "Marina Convention Center", "Santa Marta", "Calle 1", 3);
        List<VenueResponse> expected = List.of(
                new VenueResponse(1L, "VEN-SMR-01", "Marina Convention Center", "Santa Marta", "Calle 1", 3, true));
        when(venueRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(activeVenue));
        when(venueMapper.toResponseList(List.of(activeVenue))).thenReturn(expected);

        List<VenueResponse> result = venueService.findActiveVenues();

        assertThat(result).isEqualTo(expected);
    }
}
