package com.tripwise.backend.repository;

import com.tripwise.backend.entity.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {

    List<ChecklistItem> findByTripIdOrderByCreatedAtAsc(Long tripId);

    Optional<ChecklistItem> findByIdAndTripId(Long id, Long tripId);
}
