package com.taskboard.backend.boardlist;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
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
public class BoardListController {
    
    private final BoardListService boardListService;

    @GetMapping ("/boards/{boardId}/lists")
    public List<ListResponse> list(@AuthenticationPrincipal UUID userId, @PathVariable UUID boardId){
        return boardListService.listForBoard(userId, boardId);
    }

    @PostMapping("/boards/{boardId}/lists")
    @ResponseStatus(HttpStatus.CREATED)
    public ListResponse create(@AuthenticationPrincipal UUID userId , @PathVariable UUID boardId,
        @Valid @RequestBody CreateListRequest request){
        
        return boardListService.create(userId, boardId, request);
    }

    @PatchMapping("/lists/{listId}")
    public ListResponse update(@AuthenticationPrincipal UUID userId, @PathVariable UUID listId,
        @Valid @RequestBody UpdateListRequest request){

        return boardListService.update(userId, listId, request);
    }
}
