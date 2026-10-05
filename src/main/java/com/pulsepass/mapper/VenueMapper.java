package com.pulsepass.mapper;

import com.pulsepass.domain.Venue;
import com.pulsepass.dto.response.VenueResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VenueMapper {

    VenueResponse toResponse(Venue venue);

    List<VenueResponse> toResponseList(List<Venue> venues);
}
