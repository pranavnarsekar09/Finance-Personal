package com.personalproject.tracker.food.dto;

import java.time.Instant;
import java.time.LocalDate;

public record FoodLogResponse(
        String id,
        String userId,
        String imageUrl,
        String foodName,
        Double calories,
        Double protein,
        Double carbs,
        Double fat,
        Double estimatedCost,
        LocalDate date,
        String note,
        String linkedExpenseId,
        Instant createdAt
) {
}
