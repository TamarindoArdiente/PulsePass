package com.pulsepass.service;

import com.pulsepass.domain.Artist;
import com.pulsepass.dto.response.ArtistResponse;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.ArtistMapper;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.service.impl.ArtistServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArtistServiceImplTest {

    @Mock
    private ArtistRepository artistRepository;

    @Mock
    private ArtistMapper artistMapper;

    private ArtistServiceImpl artistService;

    @BeforeEach
    void setUp() {
        artistService = new ArtistServiceImpl(artistRepository, artistMapper);
    }

    @Test
    void findById_artistaExistente_retornaDto() {
        Artist artist = new Artist("Solar Beat", "Colombia", "Electronic");
        ArtistResponse expected = new ArtistResponse(1L, "Solar Beat", "Colombia", "Electronic", true);
        when(artistRepository.findById(1L)).thenReturn(Optional.of(artist));
        when(artistMapper.toResponse(artist)).thenReturn(expected);

        ArtistResponse result = artistService.findById(1L);

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void findById_artistaInexistente_lanzaResourceNotFoundException() {
        when(artistRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> artistService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
