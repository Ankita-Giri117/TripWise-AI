package com.tripwise.backend.repository;

import com.tripwise.backend.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByTripIdOrderByDateDescCreatedAtDesc(Long tripId);

    Optional<Expense> findByIdAndTripId(Long id, Long tripId);
}
