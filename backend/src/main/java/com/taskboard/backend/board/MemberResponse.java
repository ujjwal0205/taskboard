package com.taskboard.backend.board;

import java.util.UUID;

public record MemberResponse(
    UUID userId , 
    String name,
    String email,
    BoardRole role
) {

    public static MemberResponse from(BoardMember member){
        return new MemberResponse(
            member.getUser().getId(),
            member.getUser().getName(),
            member.getUser().getEmail(),
            member.getRole());
    }
    
}
