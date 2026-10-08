package com.tripwise.backend.dto;

public class ItineraryDayResponse {
    private Integer day;
    private String date;
    private ItineraryActivityResponse morning;
    private ItineraryActivityResponse afternoon;
    private ItineraryActivityResponse evening;
    private String tip;

    public ItineraryDayResponse() {
    }

    public ItineraryDayResponse(Integer day, String date, ItineraryActivityResponse morning, ItineraryActivityResponse afternoon, ItineraryActivityResponse evening, String tip) {
        this.day = day;
        this.date = date;
        this.morning = morning;
        this.afternoon = afternoon;
        this.evening = evening;
        this.tip = tip;
    }

    public Integer getDay() {
        return day;
    }

    public void setDay(Integer day) {
        this.day = day;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public ItineraryActivityResponse getMorning() {
        return morning;
    }

    public void setMorning(ItineraryActivityResponse morning) {
        this.morning = morning;
    }

    public ItineraryActivityResponse getAfternoon() {
        return afternoon;
    }

    public void setAfternoon(ItineraryActivityResponse afternoon) {
        this.afternoon = afternoon;
    }

    public ItineraryActivityResponse getEvening() {
        return evening;
    }

    public void setEvening(ItineraryActivityResponse evening) {
        this.evening = evening;
    }

    public String getTip() {
        return tip;
    }

    public void setTip(String tip) {
        this.tip = tip;
    }
}
