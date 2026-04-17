package com.personalproject.tracker.profile.dto;

import com.personalproject.tracker.profile.UserCategory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record ProfileUpsertRequest(
        @NotBlank(message = "Name is required")
        String name,
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,
        @NotNull(message = "Monthly budget is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Monthly budget must be greater than 0")
        Double monthlyBudget,
        @NotNull(message = "Calorie goal is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Calorie goal must be greater than 0")
        Double calorieGoal,
        @Valid
        List<UserCategory> categories
) {
}
