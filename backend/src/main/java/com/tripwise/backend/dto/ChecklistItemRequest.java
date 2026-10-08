package com.tripwise.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class ChecklistItemRequest {

    @NotBlank(message = "Checklist item text must not be blank")
    private String item;

    private Boolean completed;

    public ChecklistItemRequest() {
    }

    public ChecklistItemRequest(String item, Boolean completed) {
        this.item = item;
        this.completed = completed;
    }

    public String getItem() {
        return item;
    }

    public void setItem(String item) {
        this.item = item;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
}
