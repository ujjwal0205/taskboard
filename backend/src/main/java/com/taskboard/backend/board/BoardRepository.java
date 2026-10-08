package com.taskboard.backend.board;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BoardRepository extends JpaRepository<Board, UUID> {

    @Query("select b from Board b join BoardMember m on m.board = b where m.user.id = :userId order by b.createdAt desc")
    List<Board> findBoardsByUserId(@Param("userId") UUID userId);

}
