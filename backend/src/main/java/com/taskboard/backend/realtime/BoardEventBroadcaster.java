package com.taskboard.backend.realtime;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import lombok.RequiredArgsConstructor;

@Component 
@RequiredArgsConstructor 
public class BoardEventBroadcaster {

    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener (phase = TransactionPhase.AFTER_COMMIT)
    public void broadcast(BoardEvent event) {
        messagingTemplate.convertAndSend("/topic/board/" + event.boardId(), event);
    }
}
