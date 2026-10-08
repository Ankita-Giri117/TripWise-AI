package com.tripwise.backend.dto;

import java.util.List;

public class ItineraryResponse {
    private String destination;
    private List<ItineraryDayResponse> days;

    public ItineraryResponse() {
    }

    public ItineraryResponse(String destination, List<ItineraryDayResponse> days) {
        this.destination = destination;
        this.days = days;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public List<ItineraryDayResponse> getDays() {
        return days;
    }

    public void setDays(List<ItineraryDayResponse> days) {
        this.days = days;
    }
}
