package com.pulsepass.service.impl;

import com.pulsepass.domain.Artist;
import com.pulsepass.domain.Event;
import com.pulsepass.domain.EventStatus;
import com.pulsepass.domain.Venue;
import com.pulsepass.dto.request.CreateEventRequest;
import com.pulsepass.dto.response.EventResponse;
import com.pulsepass.dto.response.EventSummaryResponse;
import com.pulsepass.exception.BusinessRuleException;
import com.pulsepass.exception.DuplicateResourceException;
import com.pulsepass.exception.ResourceNotFoundException;
import com.pulsepass.mapper.EventMapper;
import com.pulsepass.repository.ArtistRepository;
import com.pulsepass.repository.EventRepository;
import com.pulsepass.repository.VenueRepository;
import com.pulsepass.service.EventService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class EventServiceImpl implements EventService {

    private static final Set<EventStatus> BLOCKED_FOR_NEW_ARTISTS =
            Set.of(EventStatus.CANCELLED, EventStatus.FINISHED);

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final ArtistRepository artistRepository;
    private final EventMapper eventMapper;
    private final Clock clock;

    public EventServiceImpl(EventRepository eventRepository,
                             VenueRepository venueRepository,
                             ArtistRepository artistRepository,
                             EventMapper eventMapper,
                             Clock clock) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.artistRepository = artistRepository;
        this.eventMapper = eventMapper;
        this.clock = clock;
    }

    @Override
    @Transactional
    public EventResponse create(CreateEventRequest request) {
        if (eventRepository.existsByEventCode(request.eventCode())) {
            throw new DuplicateResourceException("Event already exists: " + request.eventCode());
        }

        Venue venue = venueRepository.findByCode(request.venueCode())
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found: " + request.venueCode()));

        if (!venue.isActive()) {
            throw new BusinessRuleException("Cannot create an event in an inactive venue: " + request.venueCode());
        }

        if (request.eventDate() == null || !request.eventDate().isAfter(LocalDateTime.now(clock))) {
            throw new BusinessRuleException("Event date must be in the future");
        }

        if (request.minimumAge() == null || request.minimumAge() < 0) {
            throw new BusinessRuleException("Minimum age must be greater than or equal to 0");
        }

        Event event = new Event(
                request.eventCode(),
                request.name(),
                request.category(),
                EventStatus.DRAFT,
                request.eventDate(),
                request.minimumAge()
        );
        event.setDescription(request.description());
        venue.addEvent(event);

        Event saved = eventRepository.save(event);
        return eventMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponse findByCode(String eventCode) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventCode));
        return eventMapper.toResponse(event);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponse> findPublishedEvents() {
        return eventMapper.toSummaryList(
                eventRepository.findByStatusOrderByEventDateAsc(EventStatus.PUBLISHED));
    }

    @Override
    @Transactional
    public EventResponse publish(String eventCode) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventCode));

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new BusinessRuleException(
                    "Only DRAFT events can be published. Current status: " + event.getStatus());
        }

        if (!event.getEventDate().isAfter(LocalDateTime.now(clock))) {
            throw new BusinessRuleException("Cannot publish an event whose date is no longer in the future");
        }

        if (!event.getVenue().isActive()) {
            throw new BusinessRuleException("Cannot publish an event whose venue is no longer active");
        }

        event.setStatus(EventStatus.PUBLISHED);
        Event saved = eventRepository.save(event);
        return eventMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public EventResponse addArtist(String eventCode, Long artistId) {
        Event event = eventRepository.findByEventCode(eventCode)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventCode));

        Artist artist = artistRepository.findById(artistId)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found: " + artistId));

        if (BLOCKED_FOR_NEW_ARTISTS.contains(event.getStatus())) {
            throw new BusinessRuleException(
                    "Cannot add artists to an event with status: " + event.getStatus());
        }

        if (event.getArtists().contains(artist)) {
            throw new BusinessRuleException(
                    "Artist " + artist.getStageName() + " is already associated with event " + eventCode);
        }

        event.addArtist(artist);
        Event saved = eventRepository.save(event);
        return eventMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventSummaryResponse> findByArtist(String stageName) {
        return eventMapper.toSummaryList(eventRepository.findByArtistStageName(stageName));
    }
}
