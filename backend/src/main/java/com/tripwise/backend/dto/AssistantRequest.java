package com.tripwise.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class AssistantRequest {

    @NotBlank(message = "Message is required and cannot be empty")
    private String message;

    public AssistantRequest() {
    }

    public AssistantRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
