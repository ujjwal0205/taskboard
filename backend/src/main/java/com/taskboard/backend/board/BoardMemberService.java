package com.taskboard.backend.board;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.taskboard.backend.user.User;
import com.taskboard.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class BoardMemberService {
    
    private final BoardMemberRepository boardMemberRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MemberResponse> list(UUID userId, UUID boardId) {
        requireMember(boardId , userId);

        return boardMemberRepository.findAllWithUserByBoardId(boardId).stream()
        .map(MemberResponse::from)
        .toList();
    }

    @Transactional 
    public MemberResponse add(UUID userId, UUID boardId, AddMemberRequest request){
        BoardMember requester = requireOwner(boardId , userId);

        if(request.role() == BoardRole.OWNER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"A board has exactly one owner");

        }

        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No user with that email"));
                
        
        if(boardMemberRepository.existsByBoardIdAndUserId(boardId, user.getId())){
            throw new ResponseStatusException(HttpStatus.CONFLICT,"User is already a member of this board");
        }

        BoardMember member = new BoardMember();
        member.setBoard(requester.getBoard());
        member.setUser(user);
        member.setRole(request.role());


        return MemberResponse.from(boardMemberRepository.save(member));
    }

    @Transactional 
    public void remove(UUID userId, UUID boardId, UUID memberUserId) {
        requireOwner(boardId, userId);

        BoardMember target = boardMemberRepository.findByBoardIdAndUserId(boardId, memberUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        if(target.getRole() == BoardRole.OWNER){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The owner cannot be removed");
        }


        boardMemberRepository.delete(target);
    }

    public BoardMember requireMember(UUID boardId, UUID userId) {
        return boardMemberRepository.findByBoardIdAndUserId(boardId, userId)
               .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));
    }

    public BoardMember requireOwner(UUID boardId, UUID userId) {
        BoardMember member = requireMember(boardId, userId);

        if(member.getRole() != BoardRole.OWNER){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the board owner can manage members");
        }
        return member;
    }


    public BoardMember requireEditor(UUID boardId, UUID userId) {
        BoardMember member = requireMember(boardId, userId);
        if(member.getRole()==BoardRole.VIEWER){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Viewers cannot make changes");
        }
        return member;
    }

    public boolean isMember(UUID boardId, UUID userId) {
        return boardMemberRepository.existsByBoardIdAndUserId(boardId, userId);
    }
}
