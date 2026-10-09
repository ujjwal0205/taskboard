package com.taskboard.backend.card;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CardRepository extends JpaRepository<Card , UUID>{

    List<Card> findByListIdOrderByPosition(UUID listId);

    @Query("select c from Card c where c.list.board.id = :boardId order by c.position")
    List<Card> findAllByBoardId(@Param("boardId") UUID boardId);
    
}
