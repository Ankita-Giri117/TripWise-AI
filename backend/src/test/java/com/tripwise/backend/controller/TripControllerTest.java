package com.tripwise.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripwise.backend.dto.AssistantRequest;
import com.tripwise.backend.dto.ItineraryActivityResponse;
import com.tripwise.backend.dto.ItineraryDayResponse;
import com.tripwise.backend.dto.ItineraryResponse;
import com.tripwise.backend.dto.TripRequest;
import com.tripwise.backend.entity.Role;
import com.tripwise.backend.entity.Trip;
import com.tripwise.backend.entity.User;
import com.tripwise.backend.repository.TripRepository;
import com.tripwise.backend.repository.UserRepository;
import com.tripwise.backend.security.JwtService;
import com.tripwise.backend.service.GeminiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TripControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private GeminiService geminiService;

    private User user1;
    private User user2;
    private String token1;
    private String token2;

    @BeforeEach
    void setUp() {
        tripRepository.deleteAll();
        userRepository.deleteAll();

        user1 = userRepository.save(new User("Alice", "alice@example.com", passwordEncoder.encode("pass123"), Role.USER));
        user2 = userRepository.save(new User("Bob", "bob@example.com", passwordEncoder.encode("pass123"), Role.USER));

        token1 = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                user1.getEmail(), user1.getPassword(), Collections.emptyList()
        ));
        token2 = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                user2.getEmail(), user2.getPassword(), Collections.emptyList()
        ));
    }

    @Test
    void createTrip_Success() throws Exception {
        TripRequest request = new TripRequest(
                "Paris Getaway",
                "Paris, France",
                LocalDate.now().plusDays(10),
                LocalDate.now().plusDays(15),
                2,
                2500.0,
                "Romantic & Cultural"
        );

        mockMvc.perform(post("/api/trips")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.tripName", is("Paris Getaway")))
                .andExpect(jsonPath("$.destination", is("Paris, France")))
                .andExpect(jsonPath("$.travelers", is(2)))
                .andExpect(jsonPath("$.budget", is(2500.0)));
    }

    @Test
    void createTrip_EndDateBeforeStartDate_Returns400() throws Exception {
        TripRequest request = new TripRequest(
                "Invalid Trip",
                "Tokyo, Japan",
                LocalDate.now().plusDays(10),
                LocalDate.now().plusDays(5),
                1,
                1000.0,
                "Solo"
        );

        mockMvc.perform(post("/api/trips")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("End date must not be before start date")));
    }

    @Test
    void createTrip_InvalidTravelers_Returns400() throws Exception {
        TripRequest request = new TripRequest(
                "Invalid Travelers",
                "Rome, Italy",
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(5),
                0,
                500.0,
                "Budget"
        );

        mockMvc.perform(post("/api/trips")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.travelers", notNullValue()));
    }

    @Test
    void getUserTrips_ReturnsOnlyUserTrips() throws Exception {
        tripRepository.save(new Trip(user1, "Alice Trip", "London", LocalDate.now(), LocalDate.now().plusDays(3), 1, 800.0, "Business"));
        tripRepository.save(new Trip(user2, "Bob Trip", "Berlin", LocalDate.now(), LocalDate.now().plusDays(4), 2, 1200.0, "Leisure"));

        mockMvc.perform(get("/api/trips")
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].tripName", is("Alice Trip")));
    }

    @Test
    void getTripById_UserCannotAccessAnotherUsersTrip() throws Exception {
        Trip bobTrip = tripRepository.save(new Trip(user2, "Bob Trip", "Berlin", LocalDate.now(), LocalDate.now().plusDays(4), 2, 1200.0, "Leisure"));

        mockMvc.perform(get("/api/trips/" + bobTrip.getId())
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateTrip_Success() throws Exception {
        Trip trip = tripRepository.save(new Trip(user1, "Old Name", "Old Dest", LocalDate.now(), LocalDate.now().plusDays(3), 1, 500.0, "Budget"));

        TripRequest updateRequest = new TripRequest(
                "New Name",
                "New Dest",
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(4),
                2,
                1000.0,
                "Luxury"
        );

        mockMvc.perform(put("/api/trips/" + trip.getId())
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tripName", is("New Name")))
                .andExpect(jsonPath("$.destination", is("New Dest")))
                .andExpect(jsonPath("$.budget", is(1000.0)));
    }

    @Test
    void deleteTrip_Success() throws Exception {
        Trip trip = tripRepository.save(new Trip(user1, "To Delete", "Somewhere", LocalDate.now(), LocalDate.now().plusDays(3), 1, 500.0, "Budget"));

        mockMvc.perform(delete("/api/trips/" + trip.getId())
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/trips/" + trip.getId())
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isNotFound());
    }

    @Test
    void unauthenticatedRequest_Returns401() throws Exception {
        mockMvc.perform(get("/api/trips"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void generateItinerary_Success() throws Exception {
        Trip trip = tripRepository.save(new Trip(user1, "Goa Trip", "Goa", LocalDate.now(), LocalDate.now().plusDays(2), 2, 1000.0, "Beach"));

        ItineraryResponse mockItinerary = new ItineraryResponse("Goa", List.of(
                new ItineraryDayResponse(1, LocalDate.now().toString(),
                        new ItineraryActivityResponse("Beach Walk", "Morning walk on Baga Beach", 0.0),
                        new ItineraryActivityResponse("Water Sports", "Jet skiing", 50.0),
                        new ItineraryActivityResponse("Sunset Dinner", "Seafood shack dinner", 40.0),
                        "Stay hydrated and wear sunscreen."
                )
        ));

        when(geminiService.generateItinerary(any(Trip.class))).thenReturn(mockItinerary);

        mockMvc.perform(post("/api/trips/" + trip.getId() + "/itinerary/generate")
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.destination", is("Goa")))
                .andExpect(jsonPath("$.days", hasSize(1)))
                .andExpect(jsonPath("$.days[0].morning.activity", is("Beach Walk")));
    }

    @Test
    void generateItinerary_TripNotFound_Returns404() throws Exception {
        mockMvc.perform(post("/api/trips/9999/itinerary/generate")
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isNotFound());
    }

    @Test
    void getSavedItinerary_NotFound_Returns404() throws Exception {
        Trip trip = tripRepository.save(new Trip(user1, "Goa Trip", "Goa", LocalDate.now(), LocalDate.now().plusDays(2), 2, 1000.0, "Beach"));

        mockMvc.perform(get("/api/trips/" + trip.getId() + "/itinerary")
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isNotFound());
    }

    @Test
    void getSavedItinerary_AfterGenerate_ReturnsSavedItinerary() throws Exception {
        Trip trip = tripRepository.save(new Trip(user1, "Goa Trip", "Goa", LocalDate.now(), LocalDate.now().plusDays(2), 2, 1000.0, "Beach"));

        ItineraryResponse mockItinerary = new ItineraryResponse("Goa", List.of(
                new ItineraryDayResponse(1, LocalDate.now().toString(),
                        new ItineraryActivityResponse("Beach Walk", "Morning walk on Baga Beach", 0.0),
                        new ItineraryActivityResponse("Water Sports", "Jet skiing", 50.0),
                        new ItineraryActivityResponse("Sunset Dinner", "Seafood shack dinner", 40.0),
                        "Stay hydrated and wear sunscreen."
                )
        ));

        when(geminiService.generateItinerary(any(Trip.class))).thenReturn(mockItinerary);

        // Generate itinerary (which persists it)
        mockMvc.perform(post("/api/trips/" + trip.getId() + "/itinerary/generate")
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk());

        // Fetch saved itinerary
        mockMvc.perform(get("/api/trips/" + trip.getId() + "/itinerary")
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.destination", is("Goa")))
                .andExpect(jsonPath("$.days", hasSize(1)))
                .andExpect(jsonPath("$.days[0].morning.activity", is("Beach Walk")));
    }

    @Test
    void getSavedItinerary_AnotherUsersTrip_Returns404() throws Exception {
        Trip bobTrip = tripRepository.save(new Trip(user2, "Bob Trip", "Berlin", LocalDate.now(), LocalDate.now().plusDays(4), 2, 1200.0, "Leisure"));

        mockMvc.perform(get("/api/trips/" + bobTrip.getId() + "/itinerary")
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isNotFound());
    }

    @Test
    void askAssistant_Success() throws Exception {
        Trip trip = tripRepository.save(new Trip(user1, "Goa Trip", "Goa, India", LocalDate.now(), LocalDate.now().plusDays(2), 2, 1000.0, "Beach"));

        when(geminiService.askAssistant(any(Trip.class), any(), any(String.class)))
                .thenReturn("On Day 2 in Goa, you can visit Anjuna beach and enjoy local seafood.");

        AssistantRequest request = new AssistantRequest("What should I do on Day 2?");

        mockMvc.perform(post("/api/trips/" + trip.getId() + "/assistant")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply", containsString("visit Anjuna beach")));
    }

    @Test
    void askAssistant_AnotherUsersTrip_Returns404() throws Exception {
        Trip bobTrip = tripRepository.save(new Trip(user2, "Bob Trip", "Berlin", LocalDate.now(), LocalDate.now().plusDays(4), 2, 1200.0, "Leisure"));
        AssistantRequest request = new AssistantRequest("What should I do?");

        mockMvc.perform(post("/api/trips/" + bobTrip.getId() + "/assistant")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void askAssistant_TripNotFound_Returns404() throws Exception {
        AssistantRequest request = new AssistantRequest("What should I pack?");

        mockMvc.perform(post("/api/trips/9999/assistant")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void askAssistant_EmptyMessage_Returns400() throws Exception {
        Trip trip = tripRepository.save(new Trip(user1, "Goa Trip", "Goa, India", LocalDate.now(), LocalDate.now().plusDays(2), 2, 1000.0, "Beach"));
        AssistantRequest request = new AssistantRequest("");

        mockMvc.perform(post("/api/trips/" + trip.getId() + "/assistant")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.message", notNullValue()));
    }

    @Test
    void askAssistant_Unauthenticated_Returns401() throws Exception {
        AssistantRequest request = new AssistantRequest("What should I pack?");

        mockMvc.perform(post("/api/trips/1/assistant")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
