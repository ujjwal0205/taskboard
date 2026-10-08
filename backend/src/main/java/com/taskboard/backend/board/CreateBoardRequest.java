package com.taskboard.backend.board;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateBoardRequest(@NotBlank @Size(max = 100) String name) {
    
}
