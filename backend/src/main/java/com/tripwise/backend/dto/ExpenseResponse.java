package com.tripwise.backend.dto;

import com.tripwise.backend.entity.Expense;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ExpenseResponse {

    private Long id;
    private Long tripId;
    private String description;
    private String category;
    private Double amount;
    private LocalDate date;
    private LocalDateTime createdAt;

    public ExpenseResponse() {
    }

    public ExpenseResponse(Long id, Long tripId, String description, String category, Double amount, LocalDate date, LocalDateTime createdAt) {
        this.id = id;
        this.tripId = tripId;
        this.description = description;
        this.category = category;
        this.amount = amount;
        this.date = date;
        this.createdAt = createdAt;
    }

    public static ExpenseResponse fromEntity(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getTrip() != null ? expense.getTrip().getId() : null,
                expense.getDescription(),
                expense.getCategory(),
                expense.getAmount(),
                expense.getDate(),
                expense.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTripId() {
        return tripId;
    }

    public void setTripId(Long tripId) {
        this.tripId = tripId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTitle() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
