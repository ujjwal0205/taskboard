package com.taskboard.backend.board;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController 
@RequestMapping("/api/boards")
@RequiredArgsConstructor 
public class BoardController {
    

    private final BoardService boardService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BoardResponse create(@AuthenticationPrincipal UUID userId,@Valid @RequestBody CreateBoardRequest request ){
        return boardService.create(userId, request);
    }

    @GetMapping 
    public List<BoardResponse> list(@AuthenticationPrincipal  UUID userId){
        return boardService.listForUser(userId);
    }

    @GetMapping("/{boardId}")
    public BoardDetailResponse get(@AuthenticationPrincipal UUID userId, @PathVariable UUID boardId) {
        return boardService.get(userId, boardId);
    }
}
