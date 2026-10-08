package com.tripwise.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripwise.backend.dto.ChecklistItemRequest;
import com.tripwise.backend.entity.Role;
import com.tripwise.backend.entity.Trip;
import com.tripwise.backend.entity.User;
import com.tripwise.backend.repository.ChecklistItemRepository;
import com.tripwise.backend.repository.TripRepository;
import com.tripwise.backend.repository.UserRepository;
import com.tripwise.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ChecklistControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ChecklistItemRepository checklistItemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private User user1;
    private User user2;
    private String token1;
    private String token2;
    private Trip trip1;

    @BeforeEach
    void setUp() {
        checklistItemRepository.deleteAll();
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

        trip1 = tripRepository.save(new Trip(user1, "Paris Trip", "Paris, France", LocalDate.now(), LocalDate.now().plusDays(5), 2, 2000.0, "Cultural"));
    }

    @Test
    void createChecklistItem_Success() throws Exception {
        ChecklistItemRequest request = new ChecklistItemRequest("Passport", false);

        mockMvc.perform(post("/api/trips/" + trip1.getId() + "/checklist")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.item", is("Passport")))
                .andExpect(jsonPath("$.completed", is(false)));
    }

    @Test
    void getChecklist_ReturnsUserItems() throws Exception {
        ChecklistItemRequest request = new ChecklistItemRequest("Tickets", false);
        mockMvc.perform(post("/api/trips/" + trip1.getId() + "/checklist")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/trips/" + trip1.getId() + "/checklist")
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].item", is("Tickets")));
    }

    @Test
    void getChecklist_AnotherUsersTrip_Returns404() throws Exception {
        mockMvc.perform(get("/api/trips/" + trip1.getId() + "/checklist")
                .header("Authorization", "Bearer " + token2))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateChecklistItem_Success() throws Exception {
        ChecklistItemRequest createReq = new ChecklistItemRequest("Hotel Booking", false);
        String responseContent = mockMvc.perform(post("/api/trips/" + trip1.getId() + "/checklist")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long itemId = objectMapper.readTree(responseContent).get("id").asLong();

        ChecklistItemRequest updateReq = new ChecklistItemRequest("Hotel Booking", true);

        mockMvc.perform(put("/api/trips/" + trip1.getId() + "/checklist/" + itemId)
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed", is(true)));
    }

    @Test
    void deleteChecklistItem_Success() throws Exception {
        ChecklistItemRequest createReq = new ChecklistItemRequest("Medicines", false);
        String responseContent = mockMvc.perform(post("/api/trips/" + trip1.getId() + "/checklist")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long itemId = objectMapper.readTree(responseContent).get("id").asLong();

        mockMvc.perform(delete("/api/trips/" + trip1.getId() + "/checklist/" + itemId)
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/trips/" + trip1.getId() + "/checklist")
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
