package com.pulsepass.mapper;

import com.pulsepass.domain.User;
import com.pulsepass.dto.response.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "firstName", source = "userProfile.firstName")
    @Mapping(target = "lastName", source = "userProfile.lastName")
    @Mapping(target = "phone", source = "userProfile.phone")
    @Mapping(target = "city", source = "userProfile.city")
    @Mapping(target = "birthDate", source = "userProfile.birthDate")
    UserResponse toResponse(User user);
}
