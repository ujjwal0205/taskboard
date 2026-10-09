package com.taskboard.backend.board;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BoardMemberRepository extends JpaRepository<BoardMember, UUID> {

    Optional<BoardMember> findByBoardIdAndUserId(UUID boardId, UUID userId);

    boolean existsByBoardIdAndUserId(UUID boardId, UUID userId);

    @Query("select m from BoardMember m join fetch m.user where m.board.id = :boardId order by m.user.name")
    List<BoardMember> findAllWithUserByBoardId(@Param("boardId") UUID boardId);

} 
