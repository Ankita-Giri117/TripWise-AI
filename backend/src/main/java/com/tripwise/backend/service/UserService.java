package com.tripwise.backend.service;

import com.tripwise.backend.dto.UserResponse;
import com.tripwise.backend.entity.User;
import com.tripwise.backend.exception.ResourceNotFoundException;
import com.tripwise.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found for email: " + email));
        return UserResponse.fromEntity(user);
    }
}
