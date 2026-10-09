package com.taskboard.backend.boardlist;

import java.util.UUID;

import com.taskboard.backend.board.Board;
import com.taskboard.backend.common.Positioned;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity 
@Table(name= "lists")
@Getter
@Setter 
@NoArgsConstructor 
public class BoardList implements Positioned {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne (fetch = FetchType.LAZY , optional = false)
    @JoinColumn(name= "board_id")
    private Board board;

    @Column(nullable =  false)
    private String name;
    
    @Column(nullable =  false)
    private double position;
    
}
