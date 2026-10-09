package com.taskboard.backend.boardlist;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardListRepository extends JpaRepository<BoardList , UUID> {

    List<BoardList> findByBoardIdOrderByPosition(UUID boardId);
}
