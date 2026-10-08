package com.tripwise.backend.controller;

import com.tripwise.backend.dto.ExpenseRequest;
import com.tripwise.backend.dto.ExpenseResponse;
import com.tripwise.backend.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getExpenses(
            @PathVariable Long tripId,
            Authentication authentication) {
        String email = authentication.getName();
        List<ExpenseResponse> expenses = expenseService.getExpenses(email, tripId);
        return ResponseEntity.ok(expenses);
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @PathVariable Long tripId,
            @Valid @RequestBody ExpenseRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        ExpenseResponse created = expenseService.createExpense(email, tripId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long tripId,
            @PathVariable Long expenseId,
            @Valid @RequestBody ExpenseRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        ExpenseResponse updated = expenseService.updateExpense(email, tripId, expenseId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long tripId,
            @PathVariable Long expenseId,
            Authentication authentication) {
        String email = authentication.getName();
        expenseService.deleteExpense(email, tripId, expenseId);
        return ResponseEntity.noContent().build();
    }
}
