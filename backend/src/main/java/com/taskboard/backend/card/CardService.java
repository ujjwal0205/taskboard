package com.taskboard.backend.card;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.taskboard.backend.board.BoardMemberService;
import com.taskboard.backend.boardlist.BoardList;
import com.taskboard.backend.boardlist.BoardListRepository;
import com.taskboard.backend.common.Positions;
import com.taskboard.backend.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class CardService {
    
    private final CardRepository cardRepository;
    private final BoardListRepository boardListRepository;
    private final BoardMemberService boardMemberService;
    private final UserRepository userRepository;

    @Transactional 
    public CardResponse create(UUID userId, UUID listId, CreateCardRequest request){
        BoardList list = findList(listId);

        boardMemberService.requireEditor(list.getBoard().getId() , userId);

        List<Card> siblings = cardRepository.findByListIdOrderByPosition(listId);

        Card card = new Card();
        card.setList(list);
        card.setTitle(request.title().trim());
        card.setDescription(request.description());
        card.setPosition(Positions.place(siblings, siblings.size()));

        return CardResponse.from(cardRepository.saveAndFlush(card));
    }

    @Transactional 
    public CardResponse update(UUID userId, UUID cardId, UpdateCardRequest request) {
        Card card = findCard(cardId);
        
        UUID boardId = card.getList().getBoard().getId();

        boardMemberService.requireEditor(boardId, userId);

        if(card.getVersion() != request.version()){
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Card was changed by someone else. Reload and try again.");
        }

        card.setTitle(request.title().trim());
        card.setDescription(request.description());
        card.setDueDate(request.dueDate());
        card.setPriority(request.priority());

        if(request.assigneeId() == null){
            card.setAssignee(null);
        }else{
            if(!boardMemberService.isMember(boardId,request.assigneeId())){
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST , 
                    "Assignee must be a member of this board"
                );
            }
            card.setAssignee(userRepository.getReferenceById(request.assigneeId()));
        }

        return CardResponse.from(cardRepository.saveAndFlush(card));

    }


    @Transactional 
    public CardResponse move(UUID userId, UUID cardId, MoveCardRequest request){
        Card card = findCard(cardId);

        UUID boardId = card.getList().getBoard().getId();
        boardMemberService.requireEditor(boardId, userId);


        BoardList target = findList(request.listId());
        if(!target.getBoard().getId().equals(boardId)){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Target list is on a different board" );
        }

        List<Card> siblings = cardRepository.findByListIdOrderByPosition(target.getId()).stream()
                    .filter(other -> !other.getId().equals(card.getId()))
                    .toList();

        card.setList(target);
        card.setPosition(Positions.place(siblings,request.index()));

        return CardResponse.from(cardRepository.saveAndFlush(card));
    }

    @Transactional
    public void delete(UUID userId, UUID cardId){
        Card card = findCard(cardId);
        boardMemberService.requireEditor(card.getList().getBoard().getId(), userId);

        cardRepository.delete(card);
    }

    private Card findCard(UUID cardId){
        return cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Card not found"));
    }

    private BoardList findList(UUID listId) {
        return boardListRepository.findById(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "List not found"
                ));
    }

}
