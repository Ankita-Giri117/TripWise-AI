package com.tripwise.backend.dto;

import com.tripwise.backend.entity.ChecklistItem;
import java.time.LocalDateTime;

public class ChecklistItemResponse {

    private Long id;
    private Long tripId;
    private String item;
    private boolean completed;
    private LocalDateTime createdAt;

    public ChecklistItemResponse() {
    }

    public ChecklistItemResponse(Long id, Long tripId, String item, boolean completed, LocalDateTime createdAt) {
        this.id = id;
        this.tripId = tripId;
        this.item = item;
        this.completed = completed;
        this.createdAt = createdAt;
    }

    public static ChecklistItemResponse fromEntity(ChecklistItem entity) {
        return new ChecklistItemResponse(
                entity.getId(),
                entity.getTrip().getId(),
                entity.getItem(),
                entity.isCompleted(),
                entity.getCreatedAt()
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

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
