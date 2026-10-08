package com.tripwise.backend.service;

import com.tripwise.backend.dto.ChecklistItemRequest;
import com.tripwise.backend.dto.ChecklistItemResponse;
import com.tripwise.backend.entity.ChecklistItem;
import com.tripwise.backend.entity.Trip;
import com.tripwise.backend.entity.User;
import com.tripwise.backend.exception.ResourceNotFoundException;
import com.tripwise.backend.repository.ChecklistItemRepository;
import com.tripwise.backend.repository.TripRepository;
import com.tripwise.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChecklistService {

    private final ChecklistItemRepository checklistItemRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public ChecklistService(ChecklistItemRepository checklistItemRepository, TripRepository tripRepository, UserRepository userRepository) {
        this.checklistItemRepository = checklistItemRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ChecklistItemResponse> getChecklist(String userEmail, Long tripId) {
        User user = getUserByEmail(userEmail);
        Trip trip = getTripForUser(tripId, user.getId());

        return checklistItemRepository.findByTripIdOrderByCreatedAtAsc(trip.getId())
                .stream()
                .map(ChecklistItemResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChecklistItemResponse createChecklistItem(String userEmail, Long tripId, ChecklistItemRequest request) {
        User user = getUserByEmail(userEmail);
        Trip trip = getTripForUser(tripId, user.getId());

        boolean completed = request.getCompleted() != null && request.getCompleted();
        ChecklistItem item = new ChecklistItem(trip, request.getItem().trim(), completed);
        ChecklistItem saved = checklistItemRepository.save(item);

        return ChecklistItemResponse.fromEntity(saved);
    }

    @Transactional
    public ChecklistItemResponse updateChecklistItem(String userEmail, Long tripId, Long itemId, ChecklistItemRequest request) {
        User user = getUserByEmail(userEmail);
        Trip trip = getTripForUser(tripId, user.getId());

        ChecklistItem item = checklistItemRepository.findByIdAndTripId(itemId, trip.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found with id: " + itemId));

        if (request.getItem() != null && !request.getItem().isBlank()) {
            item.setItem(request.getItem().trim());
        }
        if (request.getCompleted() != null) {
            item.setCompleted(request.getCompleted());
        }

        ChecklistItem updated = checklistItemRepository.save(item);
        return ChecklistItemResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteChecklistItem(String userEmail, Long tripId, Long itemId) {
        User user = getUserByEmail(userEmail);
        Trip trip = getTripForUser(tripId, user.getId());

        ChecklistItem item = checklistItemRepository.findByIdAndTripId(itemId, trip.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found with id: " + itemId));

        checklistItemRepository.delete(item);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));
    }

    private Trip getTripForUser(Long tripId, Long userId) {
        return tripRepository.findByIdAndUserId(tripId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
    }
}
