package com.personalproject.tracker.profile;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserCategory(
        @NotBlank(message = "Category name is required")
        String name,
        @NotNull(message = "Category budget is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Category budget must be greater than 0")
        Double budget
) {
}
