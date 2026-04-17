package com.personalproject.tracker.food.dto;

import jakarta.validation.constraints.NotBlank;

public record AnalyzeFoodRequest(
        @NotBlank(message = "imageUrl is required")
        String imageUrl,
        String note
) {
}
