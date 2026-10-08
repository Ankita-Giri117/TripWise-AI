package com.tripwise.backend.controller;

import com.tripwise.backend.dto.AssistantRequest;
import com.tripwise.backend.dto.AssistantResponse;
import com.tripwise.backend.dto.ItineraryResponse;
import com.tripwise.backend.dto.TripRequest;
import com.tripwise.backend.dto.TripResponse;
import com.tripwise.backend.service.TripService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody TripRequest request, Authentication authentication) {
        String email = authentication.getName();
        TripResponse trip = tripService.createTrip(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(trip);
    }

    @GetMapping
    public ResponseEntity<List<TripResponse>> getUserTrips(Authentication authentication) {
        String email = authentication.getName();
        List<TripResponse> trips = tripService.getUserTrips(email);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getTripById(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        TripResponse trip = tripService.getTripById(email, id);
        return ResponseEntity.ok(trip);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripResponse> updateTrip(@PathVariable Long id, @Valid @RequestBody TripRequest request, Authentication authentication) {
        String email = authentication.getName();
        TripResponse updatedTrip = tripService.updateTrip(email, id, request);
        return ResponseEntity.ok(updatedTrip);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        tripService.deleteTrip(email, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/itinerary")
    public ResponseEntity<ItineraryResponse> getSavedItinerary(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        ItineraryResponse itinerary = tripService.getSavedItinerary(email, id);
        return ResponseEntity.ok(itinerary);
    }

    @PostMapping("/{id}/itinerary/generate")
    public ResponseEntity<ItineraryResponse> generateItinerary(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        ItineraryResponse itinerary = tripService.generateItinerary(email, id);
        return ResponseEntity.ok(itinerary);
    }

    @PostMapping("/{id}/assistant")
    public ResponseEntity<AssistantResponse> askAssistant(
            @PathVariable Long id,
            @Valid @RequestBody AssistantRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        AssistantResponse response = tripService.askAssistant(email, id, request);
        return ResponseEntity.ok(response);
    }
}
