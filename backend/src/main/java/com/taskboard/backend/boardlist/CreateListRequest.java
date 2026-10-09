package com.taskboard.backend.boardlist;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateListRequest(
    @NotBlank 
    @Size(max = 100)
    String name
) {
    
}
