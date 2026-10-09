package com.taskboard.backend.board;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.taskboard.backend.card.CardResponse;

public record BoardDetailResponse(
    UUID id, 
    String name,
    UUID ownerId, 
    Instant createdAt,
    List<ListDetail> lists
) {
     public record ListDetail(UUID id, String name, double position, List<CardResponse> cards) {
    }
}
