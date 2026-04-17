package com.personalproject.tracker.food.dto;

public record FoodAnalysisResponse(
        String imageUrl,
        String foodName,
        Double calories,
        Double protein,
        Double carbs,
        Double fat,
        Double estimatedCost,
        String note,
        String source
) {
}
