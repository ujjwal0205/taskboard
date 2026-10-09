package com.taskboard.backend.card;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.taskboard.backend.boardlist.BoardList;
import com.taskboard.backend.common.Positioned;
import com.taskboard.backend.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity 
@Table(name ="cards")
@Getter
@Setter 
@NoArgsConstructor 
public class Card implements Positioned{

    @Id 
    @GeneratedValue (strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY , optional = false)
    @JoinColumn (name = "list_id")
    private BoardList list;

    @Column(nullable =false)
    private String title;
    
    @Column (columnDefinition = "text")
    private String description;

    @ManyToOne (fetch = FetchType.LAZY)
    @JoinColumn (name = "assignee_id")
    private User assignee;

    @Column (nullable = false)
    private double position;

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    private CardPriority priority;


    @Version 
    private long version;

    @CreationTimestamp 
    @Column (nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;
}
