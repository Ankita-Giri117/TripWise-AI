package com.tripwise.backend.controller;

import com.tripwise.backend.dto.ChecklistItemRequest;
import com.tripwise.backend.dto.ChecklistItemResponse;
import com.tripwise.backend.service.ChecklistService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/checklist")
public class ChecklistController {

    private final ChecklistService checklistService;

    public ChecklistController(ChecklistService checklistService) {
        this.checklistService = checklistService;
    }

    @GetMapping
    public ResponseEntity<List<ChecklistItemResponse>> getChecklist(
            @PathVariable Long tripId,
            Authentication authentication) {
        String email = authentication.getName();
        List<ChecklistItemResponse> items = checklistService.getChecklist(email, tripId);
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<ChecklistItemResponse> createChecklistItem(
            @PathVariable Long tripId,
            @Valid @RequestBody ChecklistItemRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        ChecklistItemResponse item = checklistService.createChecklistItem(email, tripId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<ChecklistItemResponse> updateChecklistItem(
            @PathVariable Long tripId,
            @PathVariable Long itemId,
            @RequestBody ChecklistItemRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        ChecklistItemResponse updated = checklistService.updateChecklistItem(email, tripId, itemId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteChecklistItem(
            @PathVariable Long tripId,
            @PathVariable Long itemId,
            Authentication authentication) {
        String email = authentication.getName();
        checklistService.deleteChecklistItem(email, tripId, itemId);
        return ResponseEntity.noContent().build();
    }
}
