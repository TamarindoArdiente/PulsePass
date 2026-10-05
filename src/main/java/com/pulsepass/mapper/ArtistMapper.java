package com.pulsepass.mapper;

import com.pulsepass.domain.Artist;
import com.pulsepass.dto.response.ArtistResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ArtistMapper {

    ArtistResponse toResponse(Artist artist);

    List<ArtistResponse> toResponseList(List<Artist> artists);
}
