package com.taskboard.backend.card;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CardResponse(
    UUID id,
    UUID listId,
    String title,
    String description,
    UUID assigneeId,
    double position,
    LocalDate dueDate,
    CardPriority priority,
    long version,
    Instant createdAt,
    Instant updatedAt
) {
    
    public static CardResponse from (Card card) {
        return new CardResponse(
            card.getId(),
            card.getList().getId(),
            card.getTitle(),
            card.getDescription(),
            card.getAssignee() == null ? null : card.getAssignee().getId(),
            card.getPosition(),
            card.getDueDate(),
            card.getPriority(),
            card.getVersion(),
            card.getCreatedAt(),
            card.getUpdatedAt());
    }
}
