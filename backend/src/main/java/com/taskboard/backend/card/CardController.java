package com.taskboard.backend.card;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping("/api") 
@RequiredArgsConstructor 
public class CardController {

    private final CardService cardService;

    @PostMapping ("/lists/{listId}/cards")
    @ResponseStatus(HttpStatus.CREATED)
    public CardResponse create(@AuthenticationPrincipal UUID userId, @PathVariable UUID listId,
        @Valid @RequestBody CreateCardRequest request){
            return cardService.create(userId, listId, request);
    }

    @PatchMapping ("/cards/{cardId}")
    public CardResponse update(@AuthenticationPrincipal UUID userId, @PathVariable UUID cardId,
        @Valid @RequestBody UpdateCardRequest request){
            return cardService.update(userId, cardId, request);
    }
    
    @PostMapping ("/cards/{cardId}/move")
    public CardResponse move(@AuthenticationPrincipal UUID userId, @PathVariable UUID cardId,
        @Valid  @RequestBody MoveCardRequest request){
            return cardService.move(userId, cardId, request);
        }
    
    @DeleteMapping ("/cards/{cardId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UUID userId, @PathVariable UUID cardId){
        cardService.delete(userId, cardId);
    }
}
