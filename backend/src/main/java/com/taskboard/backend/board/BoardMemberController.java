package com.taskboard.backend.board;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/boards/{boardId}/members")
@RequiredArgsConstructor 
public class BoardMemberController {
    

    private final BoardMemberService boardMemberService;

    @GetMapping 
    public List<MemberResponse> list(@AuthenticationPrincipal  UUID userId, @PathVariable UUID boardId){
        return boardMemberService.list(userId, boardId);
    }


    @PostMapping 
    @ResponseStatus(HttpStatus.CREATED)
    public MemberResponse add(@AuthenticationPrincipal  UUID userId, @PathVariable UUID boardId,
        @Valid @RequestBody AddMemberRequest request){
            return boardMemberService.add(userId, boardId , request);
    }
    
    @DeleteMapping("/{memberUserId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@AuthenticationPrincipal UUID userId, @PathVariable UUID boardId,
        @PathVariable UUID memberUserId){
            boardMemberService.remove(userId, boardId, memberUserId);
        }
 }
