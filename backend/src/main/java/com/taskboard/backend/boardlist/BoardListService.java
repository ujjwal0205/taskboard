package com.taskboard.backend.boardlist;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.taskboard.backend.board.BoardMember;
import com.taskboard.backend.board.BoardMemberService;
import com.taskboard.backend.common.Positions;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class BoardListService {
    private final BoardListRepository boardListRepository;
    private final BoardMemberService boardMemberService;


    @Transactional(readOnly = true)
    public List<ListResponse> listForBoard(UUID userId, UUID boardId){

        boardMemberService.requireMember(boardId, userId);

        return boardListRepository.findByBoardIdOrderByPosition(boardId).stream()
                .map(ListResponse::from)
                .toList();
    }

    @Transactional 
    public ListResponse create(UUID userId, UUID boardId, CreateListRequest request){
        BoardMember member = boardMemberService.requireEditor(boardId, userId);
        List<BoardList> siblings = boardListRepository.findByBoardIdOrderByPosition(boardId);

        BoardList list = new BoardList();
        list.setBoard(member.getBoard());
        list.setName(request.name().trim());
        list.setPosition(Positions.place(siblings, siblings.size()));
        return ListResponse.from(boardListRepository.save(list));
    }

    @Transactional 
    public ListResponse update(UUID userId, UUID listId, UpdateListRequest request) {
        BoardList list = boardListRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));
        UUID boardId = list.getBoard().getId();
        boardMemberService.requireEditor(boardId, userId);

        if(request.name() != null){
            if(request.name().isBlank()){
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name must not be blank");
            }
            list.setName(request.name().trim());
        }

        if (request.index() != null){
            List<BoardList> siblings = boardListRepository.findByBoardIdOrderByPosition(boardId).stream()
                            .filter(other -> !other.getId().equals(list.getId()))
                            .toList();

            list.setPosition(Positions.place(siblings, request.index()));
            
        }

        return ListResponse.from(list);
    }
}
