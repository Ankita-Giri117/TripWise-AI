package com.tripwise.backend.service;

import com.tripwise.backend.dto.ExpenseRequest;
import com.tripwise.backend.dto.ExpenseResponse;
import com.tripwise.backend.entity.Expense;
import com.tripwise.backend.entity.Trip;
import com.tripwise.backend.entity.User;
import com.tripwise.backend.exception.BadRequestException;
import com.tripwise.backend.exception.ResourceNotFoundException;
import com.tripwise.backend.repository.ExpenseRepository;
import com.tripwise.backend.repository.TripRepository;
import com.tripwise.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository, TripRepository tripRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpenses(String userEmail, Long tripId) {
        User user = getUserByEmail(userEmail);
        Trip trip = getTripForUser(tripId, user.getId());

        return expenseRepository.findByTripIdOrderByDateDescCreatedAtDesc(trip.getId())
                .stream()
                .map(ExpenseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseResponse createExpense(String userEmail, Long tripId, ExpenseRequest request) {
        User user = getUserByEmail(userEmail);
        Trip trip = getTripForUser(tripId, user.getId());

        validateExpenseRequest(request);

        Expense expense = new Expense(
                trip,
                request.getDescription().trim(),
                request.getCategory().trim(),
                request.getAmount(),
                request.getDate()
        );
        Expense saved = expenseRepository.save(expense);
        return ExpenseResponse.fromEntity(saved);
    }

    @Transactional
    public ExpenseResponse updateExpense(String userEmail, Long tripId, Long expenseId, ExpenseRequest request) {
        User user = getUserByEmail(userEmail);
        Trip trip = getTripForUser(tripId, user.getId());

        Expense expense = expenseRepository.findByIdAndTripId(expenseId, trip.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + expenseId));

        validateExpenseRequest(request);

        expense.setDescription(request.getDescription().trim());
        expense.setCategory(request.getCategory().trim());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());

        Expense updated = expenseRepository.save(expense);
        return ExpenseResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteExpense(String userEmail, Long tripId, Long expenseId) {
        User user = getUserByEmail(userEmail);
        Trip trip = getTripForUser(tripId, user.getId());

        Expense expense = expenseRepository.findByIdAndTripId(expenseId, trip.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + expenseId));

        expenseRepository.delete(expense);
    }

    private void validateExpenseRequest(ExpenseRequest request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new BadRequestException("Amount must be greater than zero");
        }
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
