package com.tripwise.backend.service;

import com.tripwise.backend.dto.AssistantRequest;
import com.tripwise.backend.dto.AssistantResponse;
import com.tripwise.backend.dto.ItineraryResponse;
import com.tripwise.backend.dto.TripRequest;
import com.tripwise.backend.dto.TripResponse;
import com.tripwise.backend.entity.Trip;
import com.tripwise.backend.entity.User;
import com.tripwise.backend.exception.BadRequestException;
import com.tripwise.backend.exception.ResourceNotFoundException;
import com.tripwise.backend.repository.TripRepository;
import com.tripwise.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.tripwise.backend.dto.ItineraryActivityResponse;
import com.tripwise.backend.dto.ItineraryDayResponse;
import com.tripwise.backend.entity.Itinerary;
import com.tripwise.backend.entity.ItineraryActivity;
import com.tripwise.backend.entity.ItineraryDay;
import com.tripwise.backend.repository.ItineraryRepository;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ItineraryRepository itineraryRepository;
    private final GeminiService geminiService;

    public TripService(TripRepository tripRepository, UserRepository userRepository, ItineraryRepository itineraryRepository, GeminiService geminiService) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.itineraryRepository = itineraryRepository;
        this.geminiService = geminiService;
    }

    @Transactional
    public TripResponse createTrip(String userEmail, TripRequest request) {
        User user = getUserByEmail(userEmail);
        validateDates(request);

        Trip trip = new Trip(
                user,
                request.getTripName(),
                request.getDestination(),
                request.getStartDate(),
                request.getEndDate(),
                request.getTravelers(),
                request.getBudget(),
                request.getTravelStyle()
        );

        Trip savedTrip = tripRepository.save(trip);
        return TripResponse.fromEntity(savedTrip);
    }

    @Transactional(readOnly = true)
    public List<TripResponse> getUserTrips(String userEmail) {
        User user = getUserByEmail(userEmail);
        return tripRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(TripResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TripResponse getTripById(String userEmail, Long tripId) {
        User user = getUserByEmail(userEmail);
        Trip trip = getTripEntityForUser(tripId, user.getId());
        return TripResponse.fromEntity(trip);
    }

    @Transactional
    public TripResponse updateTrip(String userEmail, Long tripId, TripRequest request) {
        User user = getUserByEmail(userEmail);
        Trip trip = getTripEntityForUser(tripId, user.getId());
        validateDates(request);

        trip.setTripName(request.getTripName());
        trip.setDestination(request.getDestination());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setTravelers(request.getTravelers());
        trip.setBudget(request.getBudget());
        trip.setTravelStyle(request.getTravelStyle());

        Trip updatedTrip = tripRepository.save(trip);
        return TripResponse.fromEntity(updatedTrip);
    }

    @Transactional
    public void deleteTrip(String userEmail, Long tripId) {
        User user = getUserByEmail(userEmail);
        Trip trip = getTripEntityForUser(tripId, user.getId());
        tripRepository.delete(trip);
    }

    @Transactional
    public ItineraryResponse generateItinerary(String userEmail, Long tripId) {
        User user = getUserByEmail(userEmail);
        Trip trip = getTripEntityForUser(tripId, user.getId());
        ItineraryResponse aiResponse = geminiService.generateItinerary(trip);
        saveOrUpdateItinerary(trip, aiResponse);
        return aiResponse;
    }

    @Transactional(readOnly = true)
    public ItineraryResponse getSavedItinerary(String userEmail, Long tripId) {
        User user = getUserByEmail(userEmail);
        Trip trip = getTripEntityForUser(tripId, user.getId());
        Itinerary itinerary = itineraryRepository.findByTripId(trip.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary not found for trip id: " + tripId));
        return toItineraryResponse(itinerary);
    }

    private void saveOrUpdateItinerary(Trip trip, ItineraryResponse response) {
        Itinerary itinerary = itineraryRepository.findByTripId(trip.getId())
                .orElseGet(() -> new Itinerary(trip, response.getDestination()));

        itinerary.setDestination(response.getDestination());
        itinerary.getDays().clear();

        if (response.getDays() != null) {
            for (ItineraryDayResponse dayDto : response.getDays()) {
                ItineraryActivity morning = dayDto.getMorning() != null ?
                        new ItineraryActivity(dayDto.getMorning().getActivity(), dayDto.getMorning().getDescription(), dayDto.getMorning().getEstimatedCost()) : null;
                ItineraryActivity afternoon = dayDto.getAfternoon() != null ?
                        new ItineraryActivity(dayDto.getAfternoon().getActivity(), dayDto.getAfternoon().getDescription(), dayDto.getAfternoon().getEstimatedCost()) : null;
                ItineraryActivity evening = dayDto.getEvening() != null ?
                        new ItineraryActivity(dayDto.getEvening().getActivity(), dayDto.getEvening().getDescription(), dayDto.getEvening().getEstimatedCost()) : null;

                ItineraryDay dayEntity = new ItineraryDay(itinerary, dayDto.getDay(), dayDto.getDate(), morning, afternoon, evening, dayDto.getTip());
                itinerary.getDays().add(dayEntity);
            }
        }

        itineraryRepository.save(itinerary);
    }

    private ItineraryResponse toItineraryResponse(Itinerary itinerary) {
        List<ItineraryDayResponse> dayResponses = itinerary.getDays().stream().map(day -> {
            ItineraryActivityResponse morning = day.getMorning() != null ?
                    new ItineraryActivityResponse(day.getMorning().getActivity(), day.getMorning().getDescription(), day.getMorning().getEstimatedCost()) : null;
            ItineraryActivityResponse afternoon = day.getAfternoon() != null ?
                    new ItineraryActivityResponse(day.getAfternoon().getActivity(), day.getAfternoon().getDescription(), day.getAfternoon().getEstimatedCost()) : null;
            ItineraryActivityResponse evening = day.getEvening() != null ?
                    new ItineraryActivityResponse(day.getEvening().getActivity(), day.getEvening().getDescription(), day.getEvening().getEstimatedCost()) : null;

            return new ItineraryDayResponse(day.getDay(), day.getDate(), morning, afternoon, evening, day.getTip());
        }).collect(Collectors.toList());

        return new ItineraryResponse(itinerary.getDestination(), dayResponses);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));
    }

    private Trip getTripEntityForUser(Long tripId, Long userId) {
        return tripRepository.findByIdAndUserId(tripId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
    }

    private void validateDates(TripRequest request) {
        if (request.getStartDate() != null && request.getEndDate() != null) {
            if (request.getEndDate().isBefore(request.getStartDate())) {
                throw new BadRequestException("End date must not be before start date");
            }
        }
    }

    @Transactional(readOnly = true)
    public AssistantResponse askAssistant(String userEmail, Long tripId, AssistantRequest request) {
        User user = getUserByEmail(userEmail);
        Trip trip = getTripEntityForUser(tripId, user.getId());

        ItineraryResponse itineraryResponse = null;
        Itinerary itinerary = itineraryRepository.findByTripId(trip.getId()).orElse(null);
        if (itinerary != null) {
            itineraryResponse = toItineraryResponse(itinerary);
        }

        String reply = geminiService.askAssistant(trip, itineraryResponse, request.getMessage().trim());
        return new AssistantResponse(reply);
    }
}
