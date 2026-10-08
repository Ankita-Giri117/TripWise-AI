package com.tripwise.backend.dto;

public class ItineraryActivityResponse {
    private String activity;
    private String description;
    private Double estimatedCost;

    public ItineraryActivityResponse() {
    }

    public ItineraryActivityResponse(String activity, String description, Double estimatedCost) {
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
