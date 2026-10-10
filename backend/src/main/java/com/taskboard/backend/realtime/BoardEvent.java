package com.taskboard.backend.realtime;

import java.util.UUID;

public record BoardEvent( BoardEventType type, UUID boardId, Object payload) {

    public static BoardEvent boardChanged(UUID boardId){
        return new BoardEvent(BoardEventType.BOARD_CHANGED, boardId, null);
    }
} 