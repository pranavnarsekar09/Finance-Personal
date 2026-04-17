package com.personalproject.tracker.food.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateFoodLogRequest(
        @NotBlank(message = "userId is required")
        String userId,
        String imageUrl,
        @NotBlank(message = "Food name is required")
        String foodName,
        @NotNull(message = "Calories are required")
        @DecimalMin(value = "0.0", message = "Calories cannot be negative")
        Double calories,
        @NotNull(message = "Protein is required")
        @DecimalMin(value = "0.0", message = "Protein cannot be negative")
        Double protein,
        @NotNull(message = "Carbs are required")
        @DecimalMin(value = "0.0", message = "Carbs cannot be negative")
        Double carbs,
        @NotNull(message = "Fat is required")
        @DecimalMin(value = "0.0", message = "Fat cannot be negative")
        Double fat,
        @NotNull(message = "Estimated cost is required")
        @DecimalMin(value = "0.0", message = "Estimated cost cannot be negative")
        Double estimatedCost,
        @NotNull(message = "Date is required")
        LocalDate date,
        String note,
        String expenseCategoryName
) {
}
