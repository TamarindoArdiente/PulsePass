package com.pulsepass.repository;

import com.pulsepass.domain.Artist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;;

public interface ArtistRepository extends JpaRepository<Artist, Long> {
    Optional<Artist> findByStageName(String stageName);
}
