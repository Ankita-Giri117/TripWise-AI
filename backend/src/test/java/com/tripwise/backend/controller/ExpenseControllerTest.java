package com.tripwise.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripwise.backend.dto.ExpenseRequest;
import com.tripwise.backend.entity.Expense;
import com.tripwise.backend.entity.Role;
import com.tripwise.backend.entity.Trip;
import com.tripwise.backend.entity.User;
import com.tripwise.backend.repository.ExpenseRepository;
import com.tripwise.backend.repository.TripRepository;
import com.tripwise.backend.repository.UserRepository;
import com.tripwise.backend.security.JwtService;
import com.tripwise.backend.service.GeminiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
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
class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

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
    private Trip trip1;
    private Trip trip2;

    @BeforeEach
    void setUp() {
        expenseRepository.deleteAll();
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

        trip1 = tripRepository.save(new Trip(user1, "Paris Trip", "Paris", LocalDate.now(), LocalDate.now().plusDays(5), 2, 2000.0, "Leisure"));
        trip2 = tripRepository.save(new Trip(user2, "Rome Trip", "Rome", LocalDate.now(), LocalDate.now().plusDays(3), 1, 1000.0, "Budget"));
    }

    @Test
    void createExpense_Success() throws Exception {
        ExpenseRequest request = new ExpenseRequest("Hotel Booking", "Hotel", 250.0, LocalDate.now());

        mockMvc.perform(post("/api/trips/" + trip1.getId() + "/expenses")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.description", is("Hotel Booking")))
                .andExpect(jsonPath("$.category", is("Hotel")))
                .andExpect(jsonPath("$.amount", is(250.0)));
    }

    @Test
    void getExpenses_ReturnsTripExpenses() throws Exception {
        expenseRepository.save(new Expense(trip1, "Dinner", "Food", 45.0, LocalDate.now()));
        expenseRepository.save(new Expense(trip1, "Taxi", "Transport", 20.0, LocalDate.now()));

        mockMvc.perform(get("/api/trips/" + trip1.getId() + "/expenses")
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void updateExpense_Success() throws Exception {
        Expense expense = expenseRepository.save(new Expense(trip1, "Old Lunch", "Food", 30.0, LocalDate.now()));

        ExpenseRequest updateRequest = new ExpenseRequest("Fancy Lunch", "Food", 60.0, LocalDate.now());

        mockMvc.perform(put("/api/trips/" + trip1.getId() + "/expenses/" + expense.getId())
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description", is("Fancy Lunch")))
                .andExpect(jsonPath("$.amount", is(60.0)));
    }

    @Test
    void deleteExpense_Success() throws Exception {
        Expense expense = expenseRepository.save(new Expense(trip1, "Snack", "Food", 10.0, LocalDate.now()));

        mockMvc.perform(delete("/api/trips/" + trip1.getId() + "/expenses/" + expense.getId())
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/trips/" + trip1.getId() + "/expenses")
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void unauthenticatedRequest_Returns401() throws Exception {
        mockMvc.perform(get("/api/trips/" + trip1.getId() + "/expenses"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void nonOwner_CannotAccessAnotherUsersTripExpenses() throws Exception {
        mockMvc.perform(get("/api/trips/" + trip2.getId() + "/expenses")
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isNotFound());
    }

    @Test
    void missingTrip_Returns404() throws Exception {
        mockMvc.perform(get("/api/trips/99999/expenses")
                .header("Authorization", "Bearer " + token1))
                .andExpect(status().isNotFound());
    }

    @Test
    void negativeOrZeroAmount_Returns400() throws Exception {
        ExpenseRequest request = new ExpenseRequest("Negative expense", "Food", -10.0, LocalDate.now());

        mockMvc.perform(post("/api/trips/" + trip1.getId() + "/expenses")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void missingRequiredFields_Returns400() throws Exception {
        ExpenseRequest request = new ExpenseRequest("", "", null, null);

        mockMvc.perform(post("/api/trips/" + trip1.getId() + "/expenses")
                .header("Authorization", "Bearer " + token1)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.description", notNullValue()))
                .andExpect(jsonPath("$.errors.category", notNullValue()))
                .andExpect(jsonPath("$.errors.amount", notNullValue()))
                .andExpect(jsonPath("$.errors.date", notNullValue()));
    }
}
