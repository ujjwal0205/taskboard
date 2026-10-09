package com.taskboard.backend.board;


import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.taskboard.backend.boardlist.BoardListRepository;
import com.taskboard.backend.card.CardRepository;
import com.taskboard.backend.card.CardResponse;
import com.taskboard.backend.user.User;
import com.taskboard.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor 
public class BoardService {

    private final BoardRepository boardRepository;
    private final BoardMemberRepository boardMemberRepository;
    private final UserRepository userRepository;
    private final BoardListRepository boardListRepository;
    private final CardRepository cardRepository;

    @Transactional 
    public BoardResponse create(UUID userId, CreateBoardRequest request){
        User owner = userRepository.getReferenceById(userId);


        Board board = new Board();
        board.setName(request.name().trim());
        board.setOwner(owner);
        boardRepository.saveAndFlush(board);



        BoardMember membership = new BoardMember();
        membership.setBoard(board);
        membership.setUser(owner);
        membership.setRole(BoardRole.OWNER);
        boardMemberRepository.save(membership);

     return BoardResponse.from(board);
    }


    @Transactional(readOnly = true)
    public List<BoardResponse> listForUser(UUID userId) {
        return boardRepository.findBoardsByUserId(userId).stream()
                .map(BoardResponse::from)
                .toList();
    }

    @Transactional (readOnly = true)
    public BoardDetailResponse get(UUID userId, UUID boardId){
        BoardMember membership = boardMemberRepository.findByBoardIdAndUserId(boardId, userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Board not found"));

        Board board = membership.getBoard();

        Map<UUID , List<CardResponse>> cardsByList = cardRepository.findAllByBoardId(boardId).stream()
                                        .map(CardResponse::from)
                                        .collect(Collectors.groupingBy(CardResponse::listId));
        
         List<BoardDetailResponse.ListDetail> lists = boardListRepository.findByBoardIdOrderByPosition(boardId).stream()
                .map(list -> new BoardDetailResponse.ListDetail(list.getId(), list.getName(), list.getPosition(),
                cardsByList.getOrDefault(list.getId(), List.of())))
                .toList();

                return new BoardDetailResponse(board.getId(), board.getName(), board.getOwner().getId(),
                board.getCreatedAt(), lists);
    }

    
}
