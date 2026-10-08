package com.tripwise.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ItineraryActivity {

    private String activity;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double estimatedCost;

    public ItineraryActivity() {
    }

    public ItineraryActivity(String activity, String description, Double estimatedCost) {
        this.activity = activity;
        this.description = description;
        this.estimatedCost = estimatedCost;
    }

    public String getActivity() {
        return activity;
    }

    public void setActivity(String activity) {
        this.activity = activity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }
}
