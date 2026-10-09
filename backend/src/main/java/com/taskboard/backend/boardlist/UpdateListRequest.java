package com.taskboard.backend.boardlist;


import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record UpdateListRequest(
    @Size(max = 100) String name,
    @PositiveOrZero Integer index) {
    
}
