package com.tripwise.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "itinerary_days")
public class ItineraryDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id", nullable = false)
    private Itinerary itinerary;

    @Column(name = "day_number", nullable = false)
    private Integer day;

    @Column(name = "trip_date")
    private String date;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "activity", column = @Column(name = "morning_activity")),
            @AttributeOverride(name = "description", column = @Column(name = "morning_description", columnDefinition = "TEXT")),
            @AttributeOverride(name = "estimatedCost", column = @Column(name = "morning_estimated_cost"))
    })
    private ItineraryActivity morning;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "activity", column = @Column(name = "afternoon_activity")),
            @AttributeOverride(name = "description", column = @Column(name = "afternoon_description", columnDefinition = "TEXT")),
            @AttributeOverride(name = "estimatedCost", column = @Column(name = "afternoon_estimated_cost"))
    })
    private ItineraryActivity afternoon;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "activity", column = @Column(name = "evening_activity")),
            @AttributeOverride(name = "description", column = @Column(name = "evening_description", columnDefinition = "TEXT")),
            @AttributeOverride(name = "estimatedCost", column = @Column(name = "evening_estimated_cost"))
    })
    private ItineraryActivity evening;

    @Column(columnDefinition = "TEXT")
    private String tip;

    public ItineraryDay() {
    }

    public ItineraryDay(Itinerary itinerary, Integer day, String date, ItineraryActivity morning, ItineraryActivity afternoon, ItineraryActivity evening, String tip) {
        this.itinerary = itinerary;
        this.day = day;
        this.date = date;
        this.morning = morning;
        this.afternoon = afternoon;
        this.evening = evening;
        this.tip = tip;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Itinerary getItinerary() {
        return itinerary;
    }

    public void setItinerary(Itinerary itinerary) {
        this.itinerary = itinerary;
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

    public ItineraryActivity getMorning() {
        return morning;
    }

    public void setMorning(ItineraryActivity morning) {
        this.morning = morning;
    }

    public ItineraryActivity getAfternoon() {
        return afternoon;
    }

    public void setAfternoon(ItineraryActivity afternoon) {
        this.afternoon = afternoon;
    }

    public ItineraryActivity getEvening() {
        return evening;
    }

    public void setEvening(ItineraryActivity evening) {
        this.evening = evening;
    }

    public String getTip() {
        return tip;
    }

    public void setTip(String tip) {
        this.tip = tip;
    }
}
