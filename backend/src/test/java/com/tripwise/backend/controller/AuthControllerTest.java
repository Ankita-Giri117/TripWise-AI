package com.tripwise.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripwise.backend.dto.LoginRequest;
import com.tripwise.backend.dto.RegisterRequest;
import com.tripwise.backend.entity.Role;
import com.tripwise.backend.entity.User;
import com.tripwise.backend.repository.UserRepository;
import com.tripwise.backend.security.JwtService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void register_Success() throws Exception {
        RegisterRequest request = new RegisterRequest("Jane Doe", "jane@example.com", "secure123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email", is("jane@example.com")))
                .andExpect(jsonPath("$.name", is("Jane Doe")))
                .andExpect(jsonPath("$.role", is("USER")));
    }

    @Test
    void register_DuplicateEmail_Returns409Conflict() throws Exception {
        User existingUser = new User("Jane Doe", "jane@example.com", passwordEncoder.encode("password"), Role.USER);
        userRepository.save(existingUser);

        RegisterRequest request = new RegisterRequest("Jane Doe", "jane@example.com", "secure123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("already registered")));
    }

    @Test
    void register_InvalidEmail_Returns400BadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest("Jane Doe", "invalid-email", "secure123");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email", notNullValue()));
    }

    @Test
    void login_Success() throws Exception {
        User user = new User("John Doe", "john@example.com", passwordEncoder.encode("password123"), Role.USER);
        userRepository.save(user);

        LoginRequest request = new LoginRequest("john@example.com", "password123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.email", is("john@example.com")));
    }

    @Test
    void login_InvalidPassword_Returns401Unauthorized() throws Exception {
        User user = new User("John Doe", "john@example.com", passwordEncoder.encode("password123"), Role.USER);
        userRepository.save(user);

        LoginRequest request = new LoginRequest("john@example.com", "wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getCurrentUser_Authenticated_Success() throws Exception {
        User user = new User("John Doe", "john@example.com", passwordEncoder.encode("password123"), Role.USER);
        User saved = userRepository.save(user);

        org.springframework.security.core.userdetails.User userDetails = 
                new org.springframework.security.core.userdetails.User(
                        saved.getEmail(),
                        saved.getPassword(),
                        java.util.Collections.emptyList()
                );
        String token = jwtService.generateToken(userDetails);

        mockMvc.perform(get("/api/users/me")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("john@example.com")))
                .andExpect(jsonPath("$.name", is("John Doe")));
    }

    @Test
    void getCurrentUser_Unauthenticated_Returns401() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }
}
