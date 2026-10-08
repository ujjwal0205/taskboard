package com.taskboard.backend.board;

import java.time.Instant;
import java.util.UUID;

public record BoardResponse(
    UUID id, 
    String name,
    UUID ownerId,
    Instant createdAt
) {
    public static BoardResponse from(Board board) {
        return new BoardResponse(board.getId() , board.getName(), board.getOwner().getId(), board.getCreatedAt());
    }
}
