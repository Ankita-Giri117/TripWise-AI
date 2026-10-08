package com.tripwise.backend.dto;

import com.tripwise.backend.entity.Trip;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TripResponse {

    private Long id;
    private String tripName;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer travelers;
    private Double budget;
    private String travelStyle;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TripResponse() {
    }

    public TripResponse(Long id, String tripName, String destination, LocalDate startDate, LocalDate endDate, Integer travelers, Double budget, String travelStyle, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.tripName = tripName;
        this.destination = destination;
        this.startDate = startDate;
        this.endDate = endDate;
        this.travelers = travelers;
        this.budget = budget;
        this.travelStyle = travelStyle;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static TripResponse fromEntity(Trip trip) {
        if (trip == null) return null;
        return new TripResponse(
                trip.getId(),
                trip.getTripName(),
                trip.getDestination(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getTravelers(),
                trip.getBudget(),
                trip.getTravelStyle(),
                trip.getCreatedAt(),
                trip.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getTripName() {
        return tripName;
    }

    public String getDestination() {
        return destination;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public Integer getTravelers() {
        return travelers;
    }

    public Double getBudget() {
        return budget;
    }

    public String getTravelStyle() {
        return travelStyle;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
