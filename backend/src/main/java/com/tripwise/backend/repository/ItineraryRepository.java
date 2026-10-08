package com.tripwise.backend.repository;

import com.tripwise.backend.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {

    Optional<Itinerary> findByTripId(Long tripId);
}
