package com.taskboard.backend.card;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateCardRequest(
    @NotNull Long version,
    @NotBlank @Size(max = 200) String title,
    @Size (max = 5000) String description,
    UUID assigneeId,
    LocalDate dueDate,
    CardPriority priority
) {
    
}
