package com.pulsepass.repository;

import com.pulsepass.domain.Event;
import com.pulsepass.domain.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.*;

public interface EventRepository extends JpaRepository<Event, Long> {

    Optional<Event> findByEventCode(String eventCode);

    Boolean existsByEventCode(String eventCode);

    List<Event> findByStatusOrderByEventDate(EventStatus status);

    List<Event> findByVenueCode(String venueCode);

    @Query("""
            select distinct e
            from Event e
            join e.artists a
            where a.stageName = :stageName
            order by e.eventDate asc
            """)
    List<Event> findByArtistStageName(@Param("stageName") String stageName);

   
    @Query("""
            select distinct e
            from Event e
            join e.venue v
            join e.artists a
            where v.city = :city
            and a.stageName = :stageName
            order by e.eventDate asc
            """)
    List<Event> findByVenueCityAndArtistStageName(@Param("city") String city,
                                                   @Param("stageName") String stageName);


    @Query("""
            select distinct e
            from Event e
            join e.venue v
            join e.artists a
            where e.status = com.pulsepass.domain.EventStatus.PUBLISHED
            and e.eventDate > :afterDate
            and v.city = :city
            and lower(a.stageName) like lower(concat('%', :artistNameFragment, '%'))
            order by e.eventDate asc
            """)
    List<Event> findRecommended(@Param("afterDate") LocalDateTime afterDate,
                                 @Param("city") String city,
                                 @Param("artistNameFragment") String artistNameFragment);
}

