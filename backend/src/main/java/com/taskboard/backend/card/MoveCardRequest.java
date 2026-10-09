package com.taskboard.backend.card;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record MoveCardRequest(
    @NotNull  UUID listId,
    @NotNull @PositiveOrZero Integer index
) {
    
}
