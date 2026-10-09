package com.taskboard.backend.boardlist;


import java.util.UUID;

public record ListResponse(
    UUID id,
    UUID boardId,
    String name,
    double position
) {
    public static ListResponse from(BoardList list) {
        return new  ListResponse(list.getId() , list.getBoard().getId(), list.getName(), list.getPosition());
    }
}
